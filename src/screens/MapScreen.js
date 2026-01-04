
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Image, Pressable,RefreshControl } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { getAllUsers, getPostsForUser, fetchUserProfile  } from "../../firestoreService";
import { getAuth } from "firebase/auth";
import mapStyle from "../../mapStyle.json";
import Feather from "react-native-vector-icons/Feather";


export default function MapScreen({ navigation }) {
  const [mapRegion, setMapRegion] = useState({
    latitude: 49.1913,
    longitude: -122.8490,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const getUserId = () => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    return userId;
  };

  const fetchOtherUserProfileData = async (userId) => {
    try{
      const profile = await fetchUserProfile(userId);
      return profile;
    }catch(error){
      console.log(error);
    }
  }

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

  const fetchPosts = async () => {
    try {
      const users = await getAllUsers();
      const allPosts = [];

      for (const user of users) {
        const userPosts = await getPostsForUser(user.userId);
        const profile = await fetchOtherUserProfileData(user.userId);
        
        // allPosts.push(...userPosts); 
        userPosts.forEach((post) => {
          const distance = calculateDistance(mapRegion, post.location);
          allPosts.push({
            ...post,
            username: profile.username,
            profilePhoto: profile.profilePhoto,
            distance,
          });
        });
      }
      setUserPosts(allPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const calculateDistance = (mapRegion, postLocation) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const earthRadius = 6371;
  
    const dLat = toRad(postLocation.latitude - mapRegion.latitude);
    const dLon = toRad(postLocation.longitude - mapRegion.longitude);
  
    const lat1 = toRad(mapRegion.latitude);
    const lat2 = toRad(postLocation.latitude);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    return earthRadius * c * 1000;
  };
  


  useEffect(() => {
    fetchPosts();
    getCurrentLocation();
    fetchUserProfileData();
  }, []);

  const onRefresh = () => {
    fetchPosts();
    getCurrentLocation();
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      try {
        const locationData = await Location.getCurrentPositionAsync({});
        setMapRegion({
          ...mapRegion,
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting current position:", error);
      }
    } else {
      console.error("Location permission not granted.");
    }
  };


  const nearbyPosts = userPosts.filter((post) => {
    if (!post.location) return false;

    const distance = Math.sqrt(
      Math.pow(post.location.latitude - mapRegion.latitude, 2) +
      Math.pow(post.location.longitude - mapRegion.longitude, 2)
    );
    // console.log(distance);
    return distance < 0.1; 
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
      <Image source={require("../images/logo.png")} style={styles.logo}/>
      {userProfile && userProfile.profilePhoto && (
          <Pressable onPress={() => navigation.navigate("AccountContainer")}>
            <Image source={{ uri: userProfile.profilePhoto }} style={styles.headerPhoto} />
          </Pressable>
        )}
      </View>
      <Text style={styles.titleText}>Map</Text>

      <MapView style={styles.map} region={mapRegion} showsUserLocation={true} customMapStyle={mapStyle}>
        {userPosts.map((post) => (
          post.location && (
            <Marker
              key={post.postId}
              coordinate={{
                latitude: post.location.latitude,
                longitude: post.location.longitude,
              }}
              title={post.title}
            >
              <View style={styles.customMarker}>
                <Image
                  source={require("../images/marker2.png")} 
                  style={styles.markerImage}
                />
        </View>
            </Marker>
          )
        ))}
      </MapView>


      <View style={styles.cardList}>
        <Text style={styles.nearText}>Near Posts</Text>
        <FlatList
          data={nearbyPosts}
          keyExtractor={(item) => item.postId}
          renderItem={({ item }) => (
            <Pressable
              style={styles.postCard}
              onPress={() => navigation.navigate("DetailPost", { post: item })}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.postImage}
              />
              <View style={styles.postInfo}>
                <Text style={styles.postTitle}>{item.title}</Text>

                <View style={styles.locationContainer}>
                  <Feather name="map-pin" size={12} color={"gray"} />
                  <Text style={styles.postDistance}>
                    {item.distance < 1000
                      ? `${Math.round(item.distance)} m away`
                      : `${(item.distance / 1000).toFixed(1)} km away`}
                  </Text>
                </View>
                
                <Text style={styles.postLocation}>
                  {item.placeName}
                </Text>

                <View style={styles.cardUserContainer}>
                  <Text style={styles.cardUsername}>Posted by</Text>
                  <Image source={{ uri: item.profilePhoto }} style={styles.cardProfilephoto}/>
                </View>
              </View>
            </Pressable>
          )
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        />
         {isLoading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#919AA5",
    backgroundColor:"#eff2f9",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 15, 
    paddingTop:50,
    // paddingBottom:10,
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
    // borderColor:"#eff2f9",
    // borderWidth:1.3,
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
  map: {
    flex: 1,
  },
  cardList: {
    flex: 1,
    backgroundColor: "#eff2f9",
  },
  postCard: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginHorizontal:10,
    marginBottom:10,
    backgroundColor:"white",
    borderRadius:20,
  },
  postImage: {
    width: "40%",
    height: 130,
    borderRadius: 8,
  },
  postInfo: {
    flex:1,
    justifyContent: "space-between"
  },
  postTitle: {
    paddingLeft:10,
    fontSize: 18,
    fontWeight: "bold",
    color:"#313131"
  },
  postLocation: {
    fontSize: 13,
    color: "#313131",
    paddingLeft:10,
  },
  loadingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
  nearText:{
    marginLeft:14,
    color:"#313131",
    fontSize:16,
    margin:10,
    fontWeight:"bold",
  },
  markerImage: {
    width: 40,
    height: 40,
  },
  cardProfilephoto:{
    width:24,
    height:24,
    borderRadius:12,
  },
  cardUserContainer:{
    flexDirection:"row",
    justifyContent:"flex-end",
    paddingLeft:10,
    alignItems:"center"
  },
  cardUsername:{
    color:"gray",
    marginRight:8,
  },
  locationContainer:{
    paddingLeft:10,
    flexDirection:"row",
    alignItems:"center",
  },
  postDistance:{
    color:"gray",
    marginLeft:5,
  },
});
