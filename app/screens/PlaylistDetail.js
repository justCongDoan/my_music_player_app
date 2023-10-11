import React, { useContext } from "react";
import {Text, View, StyleSheet, Modal, FlatList, Dimensions} from 'react-native';
import color from "../misc/color";
import AudioListItem from '../components/AudioListItem';
import { selectAudio } from "../misc/audioController";
import { AudioContext } from "../context/AudioProvider";

const PlaylistDetail = (props) => {
    const context = useContext(AudioContext);
    const playlist = props.route.params;
    const playAudio = async (audio) => {
        await selectAudio(audio, context, {activePlaylist: playlist, isPlaylistRunning: true});
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{playlist.title}</Text>
            <FlatList 
                contentContainerStyle = {styles.listContainer}
                data={playlist.audios} 
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <View style={{marginBottom: 10}}>
                        <AudioListItem 
                            title={item.filename} 
                            duration={item.duration} 
                            isPlaying={context.isPlaying}
                            activeListItem={item.id === context.currentAudio.id}
                            onAudioPress={() => playAudio(item)}
                            />
                    </View>
                )}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
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