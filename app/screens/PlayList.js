import React, { useContext, useEffect, useState } from 'react';
import {View, StyleSheet, Text, ScrollView, TouchableOpacity, FlatList} from 'react-native';
import color from '../misc/color';
import PlaylistInputModal from '../components/PlaylistInputModal';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AudioContext } from '../context/AudioProvider';

const PlayerList = () => {
    const [modalVisible, setModalVisible] = useState(false);

    const context = useContext(AudioContext);

    const {playlist, addToPlaylist, updateState} = context;

    const createPlaylist = async (playlistName) => {
        const result = await AsyncStorage.getItem('playlist');
        if(result !== null) {
            const audios = [];
            if(addToPlaylist) {
                audios.push(addToPlaylist);
            }
            const newList = {
                id: Date.now(),
                title: playlistName,
                audios: audios
            };

            const updatedList = [...playlist, newList];
            updateState(context, {addToPlaylist: null, playlist: updatedList});
            await AsyncStorage.setItem('playlist', JSON.stringify(updatedList));
        }
        setModalVisible(false);
    };

    const renderPlaylist = async () => {
        const result = await AsyncStorage.getItem('playlist');
        // if user use app for the first time
        if(result === null) {
            const defaultPlaylist = {
                id: Date.now(),
                title: 'My Favorite',
                audios: []
            };

            const newPlaylist = [...playlist, defaultPlaylist];
            updateState(context, {playlist: [...newPlaylist]});
            return await AsyncStorage.setItem('playlist', JSON.stringify([...newPlaylist]));
        }

        updateState(context, {playlist: JSON.parse(result)});
    };

    useEffect(() => {
        if(!playlist.length) {
            renderPlaylist();
        }
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            
            {/* <FlatList 
                data={playlist}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => <Text>{item.title}</Text>}/> */}
            {playlist.length ? playlist.map(item =>
                <TouchableOpacity key={item.id.toString()} style={styles.playlistBanner}>
                    <Text>{item.title}</Text>
                    <Text style={styles.audioCount}>
                        {item.audios.length > 1 ? 
                        `${item.audios.length} Songs` 
                        : `${item.audios.length} Song`}</Text>
                </TouchableOpacity>
            ) : null}
            <TouchableOpacity 
                style={{marginTop: 15}}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.playlistButton}>
                    Add new Playlist
                </Text>
            </TouchableOpacity>
            <PlaylistInputModal 
                visible={modalVisible} 
                onClose={() => setModalVisible(false)}
                onSubmit={createPlaylist}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    playlistBanner: {
        padding: 5,
        backgroundColor: 'rgba(204, 204, 204, 0.3)',
        borderRadius: 5,
        marginBottom: 15,
    },
    audioCount: {
        marginTop: 3,
        opacity: 0.5,
        fontSize: 14,
    },
    playlistButton: {
        color: color.ACTIVE_BG,
        letterSpacing: 1,
        fontWeight: 'bold',
        fontSize: 14,
        padding: 5,
    }
})

export default PlayerList;