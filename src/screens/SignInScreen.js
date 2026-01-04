import { useState,useEffect } from "react";
import { StyleSheet, Text, View, TextInput, Pressable, ImageBackground,Image } from "react-native";
import { signInWithEmailAndPassword,createUserWithEmailAndPassword,onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebaseConfig.js"


export default function SignInScreen({laoding, navigation }) {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User is logged in:", user.email);
      }
    });
  
    return () => unsubscribe(); 
  }, []);
  
  const handleSignUp = async () => {
    try {
      // console.log("Attempting to sign up with", email);
      const response = await createUserWithEmailAndPassword(auth, email, password);
      // alert("Sign up success. User: " + email + " signed up.");
    } catch (error) {
      console.log("Sign up error:", error.message);
      alert(error.message);
    }
  };
  
  const handleSignIn = async () => {
    try {
      // console.log("Attempting to sign in with", email);
      const response = await signInWithEmailAndPassword(auth, email, password);
      // alert("Sign in success.");
    } catch (error) {
      console.log("Sign in error:", error.message);
      alert(error.message);
    }
  };

  return (
    <ImageBackground source={require('../images/SignInBackground.jpg')} style={styles.container}>
      <Text style={styles.title}>SPOTSHARE</Text>
      <TextInput 
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        placeholder="Enter Email"
        placeholderTextColor="#fff"
      />
      <TextInput 
        style={styles.input}
        onChangeText={setPassword}
        value={password}
        placeholder="Enter Password"
        secureTextEntry={true}
        placeholderTextColor="#fff"
      />
      <Pressable onPress={handleSignIn} style={styles.buttons_1}>
        <Text style={styles.blackText}>Sign In</Text>
      </Pressable>
      <Pressable onPress={handleSignUp} style={styles.buttons_2}>
        <Text style={styles.whiteText}>Sign Up</Text>
      </Pressable>
    {/* </View> */}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    paddingTop:80,
  },
  title:{
    marginTop:20,
    fontSize: 28,
    marginBottom:40,
    color: "#fff",
    fontFamily: "monospace",
    fontWeight: "bold",
  },
  // logo:{
  //   width:300,
  //   height:300,
  // },
  input: {
    height: 40, 
    borderColor: "white",
    fontSize:14,
    marginBottom: 30,
    width: "75%",
    borderBottomWidth: 1.5,
    color: "white",
    padding: 0, 
    paddingBottom: 5, 
    textAlignVertical: "bottom",
  },
  buttons_1: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    height: 36,
    padding: 5,
    marginTop: 20,
    width:"32%",
    borderRadius: 30,
  },
  buttons_2: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    height: 38,
    padding: 5,
    marginTop: 20,
    width:"32%",
    borderRadius: 30,
    
  },
  whiteText:{
    color:"white",
    fontSize:14,
  },
  blackText:{
    fontSize:14,
  }
});
