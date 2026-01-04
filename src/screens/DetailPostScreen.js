import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal,Animated,Pressable, ScrollView } from "react-native";
import { GestureHandlerRootView, TapGestureHandler, PinchGestureHandler,State } from "react-native-gesture-handler";
import { addUserLikedPost, removeUserLikedPost, updateLikeCount,fetchUserProfile, checkIfLiked, getPostLikeCount } from "../../firestoreService";
import Icon from "react-native-vector-icons/Ionicons";
import { auth} from "../../firebaseConfig";


export default function DetailPostScreen({ route, navigation }) {
  const { post} = route.params; 
  const [liked, setLiked] = useState(false); 
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [userProfilePhoto,setUserProfilePhoto] = useState(null);
  const [username,setUsername] =useState("");
  const [weatherData,setWeatherData] = useState(post.weather);

  const scaleAnim = useRef (new Animated.Value(0)).current;
  const opacityAnim = useRef (new Animated.Value(0)).current;

  const triggerAnimation = () => {
    scaleAnim.setValue(0);
    opacityAnim.setValue(0.8);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }

  useEffect(()=>{
    loadUserProfile();
    checkIfLikedStatus();
    fetchLikeCount();
  },[post.userId]);

  const handleLike = async () => {
  
    const incrementValue = liked? -1 : 1;

    try{
      const currentUserId = auth.currentUser.uid;
      // console.log(currentUserId);
    
      if(liked){
        await removeUserLikedPost(currentUserId, post.postId, post.userId);
        await updateLikeCount(post.userId,post.postId, -1);
        console.log("-1")
      }else{
        await addUserLikedPost(currentUserId, post.postId, post.userId);
        await updateLikeCount(post.userId,post.postId, 1);
        console.log("+1")
      }
      setLiked((prevLiked) => !prevLiked);
      setLikeCount(likeCount + incrementValue);
    }catch(error){
      console.error("Error updating like status: ", error);
    }
  };

  const loadUserProfile = async () => {
    try{
      const user = await fetchUserProfile(post.userId);
      // console.log(user);
      setUserProfilePhoto(user.profilePhoto);
      setUsername(user.username);
    }catch(error){
      console.log("Error loading user profile: ", error);
    }
  }

  const checkIfLikedStatus = async () => {
    const userId = post.userId;
    // console.log(userId);
    const isLiked = await checkIfLiked(userId, post.postId);
    setLiked(isLiked);
  };

  const fetchLikeCount = async() => {
    try{
      const likeCount = await getPostLikeCount(post.userId,post.postId);
      setLikeCount(likeCount);
    }catch(error){
      console.log(error);
    }
  }

 

  const [zoomedIn, setZoomedIn] = useState(false);
  const [lastPress,setLastPress] = useState(0);

  const onDoubleTap = (event) => {

    if (event.nativeEvent.state === State.END){
    
    const currentTime = new Date().getTime();
    const delta = currentTime - lastPress;
    const delay = 300;
    const currentUserId = auth.currentUser.uid;
    

    if(delta<delay && !liked){
        setLiked(true);
        
        try{
          addUserLikedPost(currentUserId, post.postId, post.userId);
          updateLikeCount(post.userId,post.postId, 1);
          setLikeCount(likeCount + 1);
          triggerAnimation();
        }catch(error){
          console.log(error);
        }
    }

    setLastPress(currentTime);
  };
}

  const pinchScale = useRef(new Animated.Value(1)).current;

  const onPinchStateChange = (event) => {
    if(event.nativeEvent.state === State.END){
      if(event.nativeEvent.scale>1){
        setZoomedIn(true);
      }else{
        pinchScale.setValue(1);
      }
    }
  };

  const onClose = () => {
    setZoomedIn(false);
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    
    <GestureHandlerRootView>
        
        <TapGestureHandler onHandlerStateChange={onDoubleTap}>
            <View style={styles.container}>
                <PinchGestureHandler onHandlerStateChange={onPinchStateChange} >
                    <View>
                      <View style={styles.header}>
                      <Pressable style={styles.backButton} onPress={handleBackPress}>
                        <Icon name="chevron-back-outline" size={35} color="#919AA5" />
                      </Pressable>
                        <Image source={{uri:userProfilePhoto}} style={styles.profilePhoto} />
                        <Text style={styles.usernameText}>{username}</Text>
                      </View>
                      <Image source={{ uri: post.imageUrl }} style={styles.image} />
                      <ScrollView style={styles.textContainer}>
                      <Text style={styles.title}>{post.title}</Text>
                      <Text style={styles.text}>{post.text}</Text>

                      <Text style={styles.date}>
                        {post.createdAt.toDate().toLocaleString()}
                      </Text>
                      
                      <View style={styles.locationContainer}>
                      <Icon name="compass" size={36} color="#ACC2DD"/>
                      <Text style={styles.location}>
                        {post.placeName}
                      </Text>
                      </View>

                      {weatherData && (
                <View style={styles.weatherContainer}>
                  <Image
                    source={{ uri: `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png` }}
                    style={styles.weatherIcon}
                  />
                  <View>
                    <Text style={styles.weatherText}>🌡️{weatherData.temperature}°C</Text>
                    <Text style={styles.weatherText}>  {weatherData.description}</Text>
                  </View>
                  
                </View>
              )}
                  </ScrollView>
                  </View>
                </PinchGestureHandler>

                {liked && (
                    <Animated.Image
                        source={require("../images/heart2.png")}
                        style={[
                            styles.heartAnimation,
                            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
                        ]}
                     />
                 )}
                 
                
                <Modal visible={zoomedIn} transparent={true} animationType="fade">
                    <View style={styles.zoomOverlay}>
                        <Pressable style={styles.closeOverlay} onPress={() => setZoomedIn(false)}>
                            <Text style={styles.closeText} onPress={onClose}>Close</Text>
                        </Pressable>
                        <Image source={{ uri: post.imageUrl }} style={styles.zoomedImage} />
                    </View>
                </Modal>

            </View>
        </TapGestureHandler>
    <View style={styles.bottomContainer}>
    <Pressable style={styles.likeButton} onPress={handleLike}>
      <Icon 
        name={liked ? "heart" : "heart-outline"} 
        size={18} 
        color={liked ? "red" : "black"} 
      />
      <Text style={styles.likeText}>
        {likeCount}
      </Text>
    </Pressable>
    </View>
    </GestureHandlerRootView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "white",
    backgroundColor:"#eff2f9",
  },
  header:{
    marginTop:50,
    marginBottom:15,
  },
  image: {
    width: "100%",
    height: 350,
    // borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    // paddingHorizontal:20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 20,
  },
  locationContainer: {
    marginBottom: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopColor:"gray",
    borderTopWidth:0.5,
    flexDirection: "row",
    alignItems: "center",
  },
  location:{
    fontSize: 13,
    color:"#616161",
    paddingLeft: 15,
  },
  date: {
    fontSize: 10,
    // marginBottom: 20,
    color: "#616161",
    marginTop: 10,
  },
  likeButton: {
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    // width:"40%",
    borderWidth:1,
    marginBottom:10,
    flexDirection:"row",
    justifyContent:"center",
  },
  likeText: {
    color: "black",
    fontWeight: "bold",
    paddingLeft:10,
    paddingBottom:2,
    fontSize:15,
  },
  heartAnimation: {
    position: "absolute",
    width: 100, 
    height: 100, 
    top: 300,
    left: "37%",
  },
  zoomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomedImage: {
    width: "90%",
    height: "70%",
    resizeMode: "contain",
  },
  closeOverlay: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  profilePhoto: {
    width: 34,
    height: 34,
    borderRadius: 17,
    // marginBottom: 10,
    // paddingHorizontal:20,
    marginLeft: 8,
  },
  usernameText:{
    paddingHorizontal:10,
    fontSize: 16,
    color:"#616161",
    fontWeight:"bold",
  },
  weatherContainer: {
    marginVertical: 10,
    flexDirection:"row",
    alignItems: "center",
  },
  weatherText: {
    fontSize: 13,
    color:"#616161",
    paddingLeft: 15,
  },
  weatherIcon: {
    width: 30,
    height: 30,
    marginTop: 5,
    backgroundColor:"#ACC2DD",
    borderRadius: 15,
    marginLeft: 4,
  },
  textContainer:{
    paddingHorizontal:15,  
  },
  header:{
    flexDirection:"row",
    paddingHorizontal: 8,
    marginTop: 45,
    paddingBottom: 10,
    alignItems:"center",
  },
  bottomContainer:{
    backgroundColor:"#eff2f9",
  },
});


