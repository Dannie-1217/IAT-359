import { createStackNavigator } from "@react-navigation/stack";
import ExploreScreen from "./ExploreScreen";
import DetailPostScreen from "./DetailPostScreen";

const Stack = createStackNavigator();

export default function ExploreStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Explore">
      <Stack.Screen name="Explore" component={ExploreScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="DetailPost" component={DetailPostScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
