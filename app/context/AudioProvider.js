import React, {Component, createContext} from "react";
import {Text, View, Alert, Button} from 'react-native';
import { Linking, Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import {DataProvider} from 'recyclerlistview';

export const AudioContext = createContext()

export class AudioProvider extends Component {

    constructor(props) {
        super(props);
        this.state = {
            audioFiles: [],
            permissionError: false,
            dataProvider: new DataProvider((r1, r2) => r1 !== r2),
            playbackObj: null,
            soundObj: null,
            currentAudio: {},
            isPlaying: false,
            currentAudioIndex: null,
        }
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

        this.setState({
            ...this.state, 
            dataProvider: dataProvider.cloneWithRows([...audioFiles, ...media.assets]),
            audioFiles: [...audioFiles, ...media.assets]
        })
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

    componentDidMount() {
        this.getPermission()
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
        const {audioFiles, dataProvider, permissionError, playbackObj, soundObj, currentAudio, isPlaying, currentAudioIndex} = this.state
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
            <AudioContext.Provider value={{audioFiles, dataProvider, playbackObj, soundObj, currentAudio, isPlaying, currentAudioIndex, updateState: this.updateState,}}>
                {this.props.children}
            </AudioContext.Provider>
        )
    }
}

export default AudioProvider