import {storeAudioForNextOpening} from './helper';

// play audio
export const play = async (playbackObj, uri, lastPosition) => {
    try {
        // if there's no last position
        if(!lastPosition) return await playbackObj.loadAsync(
            {uri}, 
            {shouldPlay: true, progressUpdateIntervalMillis: 1000}
        );

        // if there's last position, play that audio from the lastPosition
        await playbackObj.loadAsync(
            {uri}, 
            {progressUpdateIntervalMillis: 1000}
        );

        return await playbackObj.playFromPositionAsync(lastPosition)
    } catch (error) {
        console.log('error inside play helper method', error.message);
    }
}

// pause audio
export const pause = async (playbackObj) => {
    try {
        const status = await playbackObj.setStatusAsync(
            {shouldPlay: false}
        );
        return status;
    } catch (error) {
        console.log('error inside pause helper method', error.message);
    }
}

// resume audio
export const resume = async (playbackObj) => {
    try {
        const status = await playbackObj.playAsync();
        return status;
    } catch (error) {
        console.log('error inside resume helper method', error.message);
    }
}

// select another audio
export const playNext = async (playbackObj, uri) => {
    try {
        await playbackObj.stopAsync();
        await playbackObj.unloadAsync();
        return await play(playbackObj, uri);
    } catch (error) {
        console.log('error inside playNext helper method', error.message);
    }
}

export const selectAudio = async (audio, context, playlistInfo = {}) => {
    const {playbackObj, soundObj, currentAudio, updateState, audioFiles, onPlaybackStatusUpdate} = context;
    try {
        // play audio for the first time
        if(soundObj === null) {
            const status = await play(playbackObj, audio.uri, audio.lastPosition);
            const index = audioFiles.findIndex(({id}) => id === audio.id);
            updateState(context, {
                currentAudio: audio,
                soundObj: status,
                isPlaying: true,
                currentAudioIndex: index,
                isPlaylistRunning: false,
                activePlaylist: [],
                ...playlistInfo,
            });
            playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
            return storeAudioForNextOpening(audio, index);
        }
        
        // pause the audio
        if(soundObj.isLoaded && soundObj.isPlaying && currentAudio.id === audio.id) {
            const status = await pause(playbackObj);
            return updateState(context, {soundObj: status, isPlaying: false, playbackPosition: status.positionMillis});
        }

        // resume playing audio
        if(soundObj.isLoaded && !soundObj.isPlaying && currentAudio.id === audio.id) {
            const status = await resume(playbackObj);
            return updateState(context, {soundObj: status, isPlaying: true});
        }

        // select another audio
        if(soundObj.isLoaded && currentAudio.id !== audio.id) {
            const status = await playNext(playbackObj, audio.uri);
            const index = audioFiles.findIndex(({id}) => id === audio.id);
            updateState(context, {
                currentAudio: audio,
                soundObj: status,
                isPlaying: true,
                currentAudioIndex: index,
                isPlaylistRunning: false,
                activePlaylist: [],
                ...playlistInfo,
            });
            return storeAudioForNextOpening(audio, index);
        }
    } catch (error) {
        console.log('error inside select audio method.', error.message);
    }
};

const selectAudioFromPlaylist = async (context, select) => {
    const {activePlaylist, currentAudio, audioFiles, playbackObj, updateState} = context;
    let audio;
    let defaultIndex;
    let nextIndex;

    const indexInPlaylist = activePlaylist.audios.findIndex(({id}) => id === currentAudio.id);

    if(select === 'next') {
        nextIndex = indexInPlaylist + 1;
        defaultIndex = 0;
    }

    if(select === 'previous') {
        nextIndex = indexInPlaylist - 1;
        defaultIndex = activePlaylist.audios.length - 1;
    }
    audio = activePlaylist.audios[nextIndex];

    // if this is the last audio
    if(!audio) {
        audio = activePlaylist.audios[defaultIndex]
    }

    const indexInAllList = audioFiles.findIndex(({id}) => id === audio.id);

    const status = await playNext(playbackObj, audio.uri);
    return updateState(context, {
        soundObj: status,
        isPlaying: true,
        currentAudio: audio,
        currentAudioIndex: indexInAllList,
    });
}

export const changeAudio = async (context, select) => {
    const {
        playbackObj, 
        currentAudioIndex, 
        totalAudioCount, 
        audioFiles, 
        updateState,
        isPlaylistRunning
    } = context;

    if(isPlaylistRunning) return selectAudioFromPlaylist(context, select);

    try {
        const {isLoaded} = await playbackObj.getStatusAsync();
        const isLastAudio = currentAudioIndex + 1 === totalAudioCount;
        const isFirstAudio = currentAudioIndex <= 0;
        let audio;
        let index;
        let status;

        // for next
        if(select === 'next') {
            audio = audioFiles[context.currentAudioIndex + 1];
            if(!isLoaded && !isLastAudio) {
                index = currentAudioIndex + 1;
                status = await play(playbackObj, audio.uri);
                playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
            }
    
            if(isLoaded && !isLastAudio) {
                index = currentAudioIndex + 1;
                status = await playNext(playbackObj, audio.uri);
            }
    
            if(isLastAudio) {
                index = 0;
                audio = audioFiles[index];
                if(isLoaded) {
                    status = await playNext(playbackObj, audio.uri);
                }
                else {
                    status = await play(playbackObj, audio.uri);
                }
            }
        }

        // for previous
        if(select === 'previous') {
            audio = audioFiles[context.currentAudioIndex - 1];
            if(!isLoaded && !isFirstAudio) {
                index = currentAudioIndex - 1;
                status = await play(playbackObj, audio.uri);
                playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
            }
    
            if(isLoaded && !isFirstAudio) {
                index = currentAudioIndex - 1;
                status = await playNext(playbackObj, audio.uri);
            }
    
            if(isFirstAudio) {
                index = totalAudioCount - 1;
                audio = audioFiles[index];
                if(isLoaded) {
                    status = await playNext(playbackObj, audio.uri);
                }
                else {
                    status = await play(playbackObj, audio.uri);
                }
            }
        }

        updateState(context, {
            currentAudio: audio,
            soundObj: status,
            isPlaying: true,
            currentAudioIndex: index,
            playbackPosition: null,
            playbackDuration: null,
        });
        storeAudioForNextOpening(audio, index);
    } catch (error) {
        console.log('error inside change audio method.', error.message);
    }
};

export const moveAudio = async (context, value) => {
    const {soundObj, isPlaying, playbackObj, updateState} = context;
    if(soundObj === null || !isPlaying) return;
    try {
        const status = await playbackObj.setPositionAsync(Math.floor(soundObj.durationMillis * value));
        updateState(context, {soundObj: status, playbackPosition: status.positionMillis});
        await resume(playbackObj);
    } catch (error) {
        console.log('error inside onSlidingComplete callback', error);
    }
}