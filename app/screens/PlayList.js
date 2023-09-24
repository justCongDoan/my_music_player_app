import React from 'react';
import {View, StyleSheet, Text} from 'react-native';

const PlayerList = () => {
    return (
        <View style={styles.container}>
            <Text>Playlist</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default PlayerList;