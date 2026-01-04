import { createStackNavigator } from "@react-navigation/stack";
import AccountScreen from "./AccountScreen";
import DetailPostScreen from "./DetailPostScreen";

const Stack = createStackNavigator();

export default function AccountStackNavigator() {
  return (
    <Stack.Navigator initialRouteName="Account">
      <Stack.Screen name="Account" component={AccountScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="DetailPost" component={DetailPostScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
}