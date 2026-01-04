import { createStackNavigator } from "@react-navigation/stack";
import NewPostScreen from "./NewPostScreen";
import NearbyLocationsScreen from "./NearbyLocationsScreen";

const Stack = createStackNavigator();

export default function NewPostStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="NewPost">
      <Stack.Screen name="NewPost" component={NewPostScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="NearbyLocations" component={NearbyLocationsScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
}