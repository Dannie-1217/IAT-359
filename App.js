import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet } from "react-native";
import SignInScreen from "./src/screens/SignInScreen";
import ProtectAreaScreen from "./src/screens/ProtectAreaScreen";
import SetupScreen from "./src/screens/SetupScreen"; 
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import 'react-native-get-random-values';



export default function App() {
  const Stack = createStackNavigator();
  const [user, setUser] = useState(null);
  const [isProfileSetup, setIsProfileSetup] = useState(false);


  const checkUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      console.log(userDoc.exists() && userDoc.data().username && userDoc.data().profilePhoto);
      return userDoc.exists() && userDoc.data().username && userDoc.data().profilePhoto;
    } catch (error) {
      console.error("Error checking user profile:", error);
      return false;
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const profileStatus = await checkUserProfile(currentUser.uid);
        setIsProfileSetup(profileStatus);
      } else {
        setIsProfileSetup(false);
      }
    });

    return () => unsubscribe(); 
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        {user ? (
          isProfileSetup ? (
            <Stack.Screen
              name="ProtectArea"
              component={ProtectAreaScreen}
              options={{ headerShown: false }}
            />
          ) : (
            <Stack.Screen
              name="Setup"
              component={SetupScreen}
              options={{ headerShown: false }}
              initialParams={{
                refreshProfileSetup: async () => {
                  if (auth.currentUser) {
                    const profileStatus = await checkUserProfile(auth.currentUser.uid);
                    setIsProfileSetup(profileStatus);
                  }
                },
              }}
            />
          )
        ) : (
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


