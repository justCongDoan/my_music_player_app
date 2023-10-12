import React, {Component, createContext} from "react";
import {Text, View, Alert, Button} from 'react-native';
import { Linking, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import {DataProvider} from 'recyclerlistview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from "expo-av";
import { storeAudioForNextOpening } from "../misc/helper";
import { playNext } from "../misc/audioController";

export const AudioContext = createContext()

export class AudioProvider extends Component {

    constructor(props) {
        super(props);
        this.state = {
            audioFiles: [],
            playlist: [],
            addToPlaylist: null,
            permissionError: false,
            dataProvider: new DataProvider((r1, r2) => r1 !== r2),
            playbackObj: null,
            soundObj: null,
            currentAudio: {},
            isPlaying: false,
            isPlaylistRunning: false,
            activePlaylist: [],
            currentAudioIndex: null,
            playbackPosition: null,
            playbackDuration: null,
        };
        this.totalAudioCount = 0;
    }

    permissionAlert = () => {
        Alert.alert("Permission Required", "This app needs to read audio files!", [
            {
                text: "I am ready",
                onPress: () => this.getPermission()
            },
            {
                text: "Cancel",
                onPress: () => this.permissionAlert()
            }
        ])
    }

    getAudioFiles = async () => {
        const {dataProvider, audioFiles} = this.state
        let media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
        });
        media = await MediaLibrary.getAssetsAsync({
            mediaType: 'audio',
            first: media.totalCount,
        });
        this.totalAudioCount = media.totalCount;

        this.setState({
            ...this.state, 
            dataProvider: dataProvider.cloneWithRows([...audioFiles, ...media.assets]),
            audioFiles: [...audioFiles, ...media.assets]
        })
    }

    loadPreviousAudio = async () => {
        // objective: load audio from async storage
        let previousAudio = await AsyncStorage.getItem('previousAudio');
        let currentAudio;
        let currentAudioIndex;

        if(previousAudio === null) {
            // run app for the first time
            currentAudio = this.state.audioFiles[0];
            currentAudioIndex = 0;
        }
        else {
            previousAudio = JSON.parse(previousAudio);
            currentAudio = previousAudio.audio;
            currentAudioIndex = previousAudio.index;
        }

        this.setState({...this.state, currentAudio, currentAudioIndex});
    }

    getPermission = async () => {
        // {"canAskAgain": true, "expires": "never", "granted": false, "status": "undetermined"}

        const permission = await MediaLibrary.getPermissionsAsync();
        if(permission.granted) {
            // get all audio files
            this.getAudioFiles()
        }

        if(!permission.canAskAgain && !permission.granted) {
            this.setState({...this.state, permissionError: true})
        }
        
        if(!permission.granted && permission.canAskAgain) {
            const {status, canAskAgain} = await MediaLibrary.requestPermissionsAsync();
            if(status === 'denied' && canAskAgain) {
                // display alert that user must allow this permission to work
                this.permissionAlert();
            }
            if(status === 'granted') {
                // get all audio files
                this.getAudioFiles()
            }
            if(status === 'denied' && !canAskAgain) {
                // display some errors to user
                this.setState({...this.state, permissionError: true})
            }
        }
    }

    onPlaybackStatusUpdate = async (playbackStatus) => {
        if(playbackStatus.isLoaded && playbackStatus.isPlaying) {
            this.updateState(this, {
                playbackPosition: playbackStatus.positionMillis,
                playbackDuration: playbackStatus.durationMillis,
            });
        }

        if(playbackStatus.isLoaded && !playbackStatus.isPlaying) {
            storeAudioForNextOpening(this.state.currentAudio, this.state.currentAudioIndex, playbackStatus.positionMillis);
        }

        if(playbackStatus.didJustFinish) {
            if(this.state.isPlaylistRunning) {
                let audio;
                const indexInPlaylist = this.state.activePlaylist.audios.findIndex(({id}) => id === this.state.currentAudio.id);
                const nextIndex = indexInPlaylist + 1;
                audio = this.state.activePlaylist.audios[nextIndex];

                // if this is the last audio
                if(!audio) {
                    audio = this.state.activePlaylist.audios[0]
                }

                const indexInAllList = this.state.audioFiles.findIndex(({id}) => id === audio.id);

                const status = await playNext(this.state.playbackObj, audio.uri);
                return this.updateState(this, {
                    soundObj: status,
                    isPlaying: true,
                    currentAudio: audio,
                    currentAudioIndex: indexInAllList,
                });
            }
            const nextAudioIndex = this.state.currentAudioIndex + 1;
            // there's no audio to play next or we're playing the last one
            if(nextAudioIndex >= this.totalAudioCount) {
                this.state.playbackObj.unloadAsync();
                this.updateState(this, {
                    soundObj: null,
                    currentAudio: this.state.audioFiles[0],
                    isPlaying: true,
                    currentAudioIndex: 0,
                    playbackPosition: null,
                    playbackDuration: null,
                });
                return await storeAudioForNextOpening(this.state.audioFiles[0], 0);
            }
            // otherwise we select the next audio
            const audio = this.state.audioFiles[nextAudioIndex];
            const status = await playNext(this.state.playbackObj, audio.uri);
            this.updateState(this, {
                soundObj: status,
                currentAudio: audio,
                isPlaying: true,
                currentAudioIndex: nextAudioIndex
            });
            await storeAudioForNextOpening(audio, nextAudioIndex);
        }
    }

    componentDidMount() {
        this.getPermission();
        if(this.state.playbackObj === null) {
            this.setState({...this.state, playbackObj: new Audio.Sound()})
        }
    }

    updateState = (prevState, newState = {}) => {
        this.setState({...prevState, ...newState})
    }

    openAppSettings() {
        if (Platform.OS === 'ios') {
          Linking.openURL('app-settings:');
        } else {
          Linking.openSettings();
        }
    };

    render() {
        const {
            audioFiles, 
            playlist,
            addToPlaylist,
            dataProvider, 
            permissionError, 
            playbackObj, 
            soundObj, 
            currentAudio, 
            isPlaying, 
            currentAudioIndex,
            playbackPosition,
            playbackDuration,
            isPlaylistRunning,
            activePlaylist
        } = this.state
        if(permissionError) {
            return (
                <View style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Text style={{
                        fontSize: 25,
                        textAlign: 'center',
                        color: 'blue'
                    }}>Please accept the permission to access to the audio files</Text>
                    <Button title="Change Permissions" onPress={this.openAppSettings} />
                </View>
            )
        }
        return (
            <AudioContext.Provider value={
                {
                    audioFiles, 
                    playlist,
                    addToPlaylist,
                    dataProvider, 
                    playbackObj, 
                    soundObj, 
                    currentAudio, 
                    isPlaying, 
                    currentAudioIndex, 
                    totalAudioCount: this.totalAudioCount,
                    playbackPosition,
                    playbackDuration,
                    isPlaylistRunning,
                    activePlaylist,
                    updateState: this.updateState, 
                    loadPreviousAudio: this.loadPreviousAudio,
                    onPlaybackStatusUpdate: this.onPlaybackStatusUpdate
                }}>
                {this.props.children}
            </AudioContext.Provider>
        )
    }
}

export default AudioProvider