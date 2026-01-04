import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ExploreContainerScreen from "./ExploreContainerScreen";
import AccountContainerScreen from "./AccountContainerScreen";
import NewPostContainerScreen from "./NewPostContainerScreen";
import MapContainerScreen from "./MapContianerScreen";
import { Ionicons } from 'react-native-vector-icons'; 
import { StyleSheet } from "react-native";

export default function ProtectAreaScreen() {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      initialRouteName="ExploreContainer"
      screenOptions={{
        tabBarStyle: styles.tabBarStyle,
      }}
    >
      <Tab.Screen 
        name="ExploreContainer" 
        component={ExploreContainerScreen} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name="home" 
              size={28} 
              color={focused ? "#313131" : "white"}
            />
          ),
          tabBarLabel: () => null,
        }} 
      />
      <Tab.Screen 
        name="MapContainer" 
        component={MapContainerScreen} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name="map" 
              size={28} 
              color={focused ? "#313131" : "white"}
            />
          ),
          tabBarLabel: () => null,
        }} 
      />
      <Tab.Screen 
        name="NewPostContainer" 
        component={NewPostContainerScreen} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name="add-circle" 
              size={28} 
              color={focused ? "#313131" : "white"} 
            />
          ),
          tabBarLabel: () => null,
        }} 
      />
      <Tab.Screen 
        name="AccountContainer" 
        component={AccountContainerScreen} 
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name="person" 
              size={28} 
              color={focused ? "black" : "white"} 
            />
          ),
          tabBarLabel: () => null,
        }} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 45,
    backgroundColor:"#ACC2DD",
  },
});
