import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './app/navigation/AppNavigation';
import AudioProvider from './app/context/AudioProvider';
import { View } from 'react-native';
import AudioListItem from './app/components/AudioListItem';

export default function App() {
  return (
    <AudioProvider>
      <NavigationContainer>
        <AppNavigator/>
      </NavigationContainer>
    </AudioProvider>
    
  );
}