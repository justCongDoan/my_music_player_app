import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import AudioList from '../screens/AudioList';
import PlayerList from '../screens/PlayList';
import Player from '../screens/Player';
import {MaterialIcons, FontAwesome5} from '@expo/vector-icons';
import PlaylistDetail from '../screens/PlaylistDetail';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const PlaylistScreen = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name='PlayList' component={PlayerList}/>
            <Stack.Screen name='PlayListDetail' component={PlaylistDetail}/>
        </Stack.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name='AudioList' component={AudioList}
                options={{
                    tabBarIcon: ({color, size}) => (<MaterialIcons name="headset" size={size} color={color} />),
                }}
            />
            <Tab.Screen name='Player' component={Player}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <FontAwesome5 name="compact-disc" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen name='PlayList' component={PlaylistScreen}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <MaterialIcons name="library-music" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default AppNavigator;