import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import AppNavigator from './app/navigation/AppNavigation';
import AudioProvider from './app/context/AudioProvider';
import { View } from 'react-native';
import AudioListItem from './app/components/AudioListItem';
import color from './app/misc/color';

const MyAppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: color.APP_BG,
  }
};

export default function App() {
  return (
    <AudioProvider>
      <NavigationContainer theme={MyAppTheme}>
        <AppNavigator/>
      </NavigationContainer>
    </AudioProvider>
    
  );
}