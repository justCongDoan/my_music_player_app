import React, { useContext, useState } from "react";
import {Text, View, StyleSheet, Modal, FlatList, Dimensions, TouchableOpacity} from 'react-native';
import color from "../misc/color";
import AudioListItem from '../components/AudioListItem';
import { selectAudio } from "../misc/audioController";
import { AudioContext } from "../context/AudioProvider";
import OptionModal from "../components/OptionModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PlaylistDetail = (props) => {
    const context = useContext(AudioContext);
    const playlist = props.route.params;

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState({});
    const [audios, setAudios] = useState(playlist.audios);

    const playAudio = async (audio) => {
        await selectAudio(audio, context, {activePlaylist: playlist, isPlaylistRunning: true});
    };

    const closeModal = () => {
        setSelectedItem({});
        setModalVisible(false);
    };

    const removeAudio = async () => {
        let isPlaying = context.isPlaying;
        let isPlaylistRunning = context.isPlaylistRunning;
        let soundObj = context.soundObj;
        let playbackPosition = context.playbackPosition;
        let activePlaylist = context.activePlaylist;

        // if the removed item is the one that is playing
        if(context.isPlaylistRunning && context.currentAudio.id === selectedItem.id) {
            // stop playing tht audio
            await context.playbackObj.stopAsync();
            await context.playbackObj.unloadAsync();
            isPlaying = false;
            isPlaylistRunning = false;
            soundObj = null;
            playbackPosition = 0;
            activePlaylist = [];
        }

        const newAudios = audios.filter(audio => audio.id !== selectedItem.id);
        const result = await AsyncStorage.getItem('playlist');
        if(result !== null) {
            const oldPlaylist = JSON.parse(result);
            const updatedPlaylist = oldPlaylist.filter((item) => {
                if(item.id === playlist.id) {
                    item.audios = newAudios;
                }
                return item;
            });
            AsyncStorage.setItem('playlist', JSON.stringify(updatedPlaylist));
            context.updateState(context, 
                {
                    playlist: updatedPlaylist,
                    isPlaylistRunning,
                    activePlaylist,
                    playbackPosition,
                    isPlaying,
                    soundObj
                })
        }
        setAudios(newAudios);
        closeModal();
    };

    const removePlaylist = async () => {
        let isPlaying = context.isPlaying;
        let isPlaylistRunning = context.isPlaylistRunning;
        let soundObj = context.soundObj;
        let playbackPosition = context.playbackPosition;
        let activePlaylist = context.activePlaylist;

        // if the removed item is the one that is playing
        if(context.isPlaylistRunning && activePlaylist.id === playlist.id) {
            // stop playing tht audio
            await context.playbackObj.stopAsync();
            await context.playbackObj.unloadAsync();
            isPlaying = false;
            isPlaylistRunning = false;
            soundObj = null;
            playbackPosition = 0;
            activePlaylist = [];
        }
        
        const result = await AsyncStorage.getItem('playlist');
        if(result !== null) {
            const oldPlaylist = JSON.parse(result);
            const updatedPlaylist = oldPlaylist.filter((item) => item.id !== playlist.id);
            AsyncStorage.setItem('playlist', JSON.stringify(updatedPlaylist));
            context.updateState(context, 
                {
                    playlist: updatedPlaylist,
                    isPlaylistRunning,
                    activePlaylist,
                    playbackPosition,
                    isPlaying,
                    soundObj
                })
        }
        props.navigation.goBack();
    };

    return (
        <>
            <View style={styles.container}>
                <View style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 15,
                }}>
                    <Text style={styles.title}>{playlist.title}</Text>
                    <TouchableOpacity onPress={removePlaylist}>
                        <Text style={[styles.title, {color: 'red'}]}>Remove</Text>
                    </TouchableOpacity>
                </View>
                {audios.length ? <FlatList 
                    contentContainerStyle = {styles.listContainer}
                    data={audios} 
                    keyExtractor={item => item.id.toString()}
                    renderItem={({item}) => (
                        <View style={{marginBottom: 10}}>
                            <AudioListItem 
                                title={item.filename} 
                                duration={item.duration} 
                                isPlaying={context.isPlaying}
                                activeListItem={item.id === context.currentAudio.id}
                                onAudioPress={() => playAudio(item)}
                                onOptionPress={() => {
                                    setSelectedItem(item);
                                    setModalVisible(true);
                                }}
                            />
                        </View>
                    )}/> : 
                    (
                        <Text style={{
                            fontWeight: 'bold', 
                            color: color.FONT_LIGHT,
                            fontSize: 25,
                            paddingTop: 50,
                        }}>
                            No Audio
                        </Text>
                    )
                    }
            </View>
            <OptionModal
                visible={modalVisible}
                onClose={closeModal}
                options={[
                    {
                        title: 'Remove from playlist',
                        onPress: removeAudio
                    }
                ]}
                currentItem={selectedItem}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    listContainer: {
        padding: 20,
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
        paddingVertical: 5,
        fontWeight: 'bold',
        color: color.ACTIVE_BG,
    },
});

export default PlaylistDetail;