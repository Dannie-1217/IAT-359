import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, Pressable, StyleSheet, RefreshControl, ActivityIndicator, ImageBackground } from "react-native";
import { getAllUsers,getPostsForUser,fetchUserProfile  } from "../../firestoreService";
import { getAuth } from "firebase/auth";
import Feather from "react-native-vector-icons/Feather";

export default function ExploreScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true); 
      const users = await getAllUsers(); 
      // console.log("here:", users);  

      const postsList = [];
      
      for (const user of users) {
        const userPosts = await getPostsForUser(user.userId);  
        const profile = await fetchOtherUserProfileData(user.userId);
        // console.log("here: ",profile);
        const enrichedPosts = userPosts.map((post) => ({
          ...post,
          userProfilePhoto:profile.profilePhoto,
          username: profile.username,
        }))

        postsList.push(...enrichedPosts); 
      }
      
      setPosts(postsList);  
      setIsLoading(false); 
    } catch (error) {
      setIsLoading(false);
      console.log('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();  
    fetchUserProfileData();
    // console.log("2");
  }, []);
  
  const onRefresh = () => {
    fetchPosts(); 
  };


  const getUserId = () => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("User not authenticated");
      Alert.alert("Error", "You must be logged in to set up your profile");
      return null;
    }
    return userId;
  };

  const fetchUserProfileData = async () => {
    try{
      const userId = getUserId();
      const profile = await fetchUserProfile(userId);
      setUserProfile(profile);
      //console.log("current user: ", profile);
    }catch(error){
      console.log(error);
    }
  }

  const fetchOtherUserProfileData = async (userId) => {
    try{
      const profile = await fetchUserProfile(userId);
      return profile;
    }catch(error){
      console.log(error);
    }
  }

 

  const renderItem = ({ item }) => {
    return (
      <Pressable
        style={styles.card}
        onPress={() => navigation.navigate("DetailPost", { post: item })}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={styles.cardInfo}>
          <View style={styles.userInfo}>
            {item.userProfilePhoto && (
            <Image source={{ uri: item.userProfilePhoto }} style={styles.cardUserPhoto} />
            )}
            <Text style={styles.username}>{item.username}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.likeCount}>
              <Feather name={"heart"} style={styles.heart_icon}/> {item.likeCount}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <ImageBackground   style={styles.container}>
      <View style={styles.titleContainer}>
      <Image source={require("../images/logo.png")} style={styles.logo}/>
      {userProfile && userProfile.profilePhoto && (
          <Pressable onPress={() => navigation.navigate("AccountContainer")}>
            <Image source={{ uri: userProfile.profilePhoto }} style={styles.headerPhoto} />
          </Pressable>
        )}
      </View>
      <Text style={styles.titleText}>Explore</Text>
      {/* <Text style={styles.titleSubText}>Trending Visits</Text> */}
      <View style={styles.cardsContianer}>
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.postId}
          numColumns={2} 
          contentContainerStyle={styles.flatList}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        />
      
        {/* {isLoading && (
          <ActivityIndicator size="large"  />
        )} */}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eff2f9",
  },
  titleText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign:"center",
    marginTop:-20,
    fontFamily: "sans-serif",
    marginBottom: 10,
    color:"#313131",
  },
  titleSubText: {
    fontSize: 16,
    color:"#6e7f8d",
    paddingHorizontal: 30, 
    marginBottom: 10,
    fontFamily: "sans-serif",
    marginTop:20,
  },
  logo:{
    width: 60,
    height: 40,
    marginLeft:-12,
  },
  headerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // borderColor:"white",
    // borderWidth:1.3,
  },
  headerUsername:{
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "bold",
    // fontFamily: "monospace",
    color:"#6e7f8d",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 15, 
    paddingTop:50,
  },
  cardsContianer:{
    // alignItems:"center",
    // alignSelf:"center",
  },
  flatList: {
    justifyContent: 'flex-start',
    paddingBottom: 150,
    paddingTop:10,
  },
  card: {
    width:"45%",
    // marginHorizontal:"1.5%",
    marginLeft:13,
    marginTop:10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderColor: "white",
    // borderWidth:2,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: 180,
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    borderRadius:20,
  },
  cardTitle: {
    fontSize: 16,
    color:'#313131',
    marginTop:5,
    paddingLeft: 13,
    marginBottom: 5
  },
  cardInfo:{
    flexDirection:"row",
    justifyContent: "space-between",
    paddingHorizontal: 13,
  },
  userInfo:{
    flexDirection:"row",
  },
  username:{
    fontSize:15,
    marginLeft:5,
    color:"#6e7f8d",
  },
  cardUserPhoto:{
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 5,
  },
  likeCount: {
    fontSize: 15,
    marginLeft: 5,
    color:"#6e7f8d",
  },
  // loadingIndicator: {
  //   position: "absolute",
  //   top: "50%",
  //   left: "50%",
  // },
});

