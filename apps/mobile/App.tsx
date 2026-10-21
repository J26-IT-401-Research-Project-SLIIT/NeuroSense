import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HandwritingAssessmentScreen from "./src/screens/HandwritingAssessmentScreen";
import AssessmentResultScreen from "./src/screens/AssessmentResultScreen";
import type { HandwritingPredictionResponse } from "./src/services/handwritingApi";

export type RootStackParamList = {
  HandwritingAssessment: undefined;
  AssessmentResult: {
    spiralUri: string;
    meanderUri: string;
    result: HandwritingPredictionResponse;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HandwritingAssessment"
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
