import React, { useState } from 'react';
import {View, StyleSheet, Text, ScrollView, TouchableOpacity} from 'react-native';
import color from '../misc/color';
import PlaylistInputModal from '../components/PlaylistInputModal';

const PlayerList = () => {
    const [modalVisible, setModalVisible] = useState(false);
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={styles.playlistBanner}>
                <Text>My Playlist</Text>
                <Text style={styles.audioCount}>0 songs</Text>
            </TouchableOpacity>
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