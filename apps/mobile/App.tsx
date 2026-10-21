import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HandwritingAssessmentScreen from './src/screens/HandwritingAssessmentScreen';
import AssessmentResultScreen from './src/screens/AssessmentResultScreen';

export type RootStackParamList = {
  HandwritingAssessment: undefined;
  AssessmentResult: {
    spiralUri: string;
    meanderUri: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AssessmentResult"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="HandwritingAssessment"
          component={HandwritingAssessmentScreen}
        />

        <Stack.Screen
          name="AssessmentResult"
          component={AssessmentResultScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}