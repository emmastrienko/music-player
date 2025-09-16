// Must be first
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { registerRootComponent } from 'expo';
import App from './App';

// This ensures App is properly registered and the environment is ready
registerRootComponent(App);
