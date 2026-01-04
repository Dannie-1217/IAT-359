import { createStackNavigator } from "@react-navigation/stack";
import MapScreen from "./MapScreen";
import DetailPostScreen from "./DetailPostScreen";

const Stack = createStackNavigator();

export default function MapStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Map">
      <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="DetailPost" component={DetailPostScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
}