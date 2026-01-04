import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, Button, Image, Alert, ImageBackground, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { addUser } from "../../firestoreService";
import Feather from "react-native-vector-icons/Feather";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function SetupScreen({ navigation, route }) {
  const { refreshProfileSetup } = route.params;
  const [username, setUsername] = useState("");
  const [profilePhotoUri, setProfilePhotoUri] = useState(null);

  const getUserId = () => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    return userId;
  };

  const pickImage = async () => {
    const options = [
      { text: "Take Photo", onPress: captureImage },
      { text: "Choose from Library", onPress: selectFromLibrary },
      { text: "Cancel", style: "cancel" },
    ];
    Alert.alert("Upload Profile Photo", "Choose an option", options);
  };

  const captureImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera access is required to take a photo");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setProfilePhotoUri(result.assets[0].uri);
    }
  };

  const selectFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Library access is required to select a photo");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 1,
    });
    if (!result.canceled) {
      setProfilePhotoUri(result.assets[0].uri);
    }
  };

const handleSave = async () => {
    const userId = getUserId();
    if (!userId || !username || !profilePhotoUri) {
      Alert.alert("Error", "Please fill in all fields and upload a profile photo.");
      return;
    }
  
    try {
      const storage = getStorage();
      const profilePhotoRef = ref(storage, `profilePhotos/${userId}.jpg`);
      const response = await fetch(profilePhotoUri);
      const blob = await response.blob();

      await uploadBytes(profilePhotoRef,blob);
      const downloadURL = await getDownloadURL(profilePhotoRef);

      await addUser(userId, username, downloadURL);
      // Alert.alert("Success", "Profile setup complete!");
      refreshProfileSetup();

    } catch (error) {
      console.error("Error saving user profile:", error);
      Alert.alert("Error", "Failed to save profile information.");
    }
  };
  
  

  return (
    <ImageBackground source={require('../images/SignInBackground.jpg')} style={styles.container}>
      <View>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subTitle}>Start your SpotShare journey...</Text>
      </View>
      <Pressable onPress={pickImage} style={styles.imageContainer}>
        {profilePhotoUri ? (
          <Image source={{ uri: profilePhotoUri }} style={styles.imagePreview} />
        ) : (
          <Image source={require('../images/default_profile.webp')} style={styles.imagePreview}/>
        )}
        <View style={styles.editContainer}>
          <Feather name={"edit-3"} style={styles.icon}/>
        </View>
      </Pressable>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor="#ccc"
      />

      <Pressable onPress={handleSave} style={styles.button}>
        <Text>Save Profile</Text>
      </Pressable>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    paddingTop:100,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "monospace",
    color:"white",
  },
  subTitle:{
    fontSize: 16,
    // fontWeight: "bold",
    marginBottom: 40,
    fontFamily: "monospace",
    color:"white",
    marginTop: 15,
  },
  input: {
    height: 40, 
    borderColor: "#ccc",
    fontSize:18,
    marginBottom: 30,
    width: "30%",
    borderBottomWidth: 1.5,
    color: "white",
    padding: 0, 
    paddingBottom: 5, 
    textAlignVertical: "bottom",
    marginTop:25,
    textAlign:"center",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 20,
  },
  editContainer:{
    height:30,
    width:30,
    backgroundColor:"orange",
    borderRadius:15,
    justifyContent:"center",
    alignItems:"center",
    marginTop:-55,
    marginLeft:65,
  },
  icon:{
    fontSize:20,
    color:"white"
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    height: 35,
    padding:0,
    marginTop: 20,
    width:"30%",
    borderRadius: 30,
  },
});
