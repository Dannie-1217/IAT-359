import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Text, TextInput, Button, Image, View, KeyboardAvoidingView, Platform, Alert, Pressable } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location'; 
import { addPost } from '../../firestoreService';
import shortid from 'shortid';
import { GeoPoint } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from '@react-navigation/native';


const WEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

export default function NewPostScreen() {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [placeName, setPlaceName] = useState('');
  const [placeDetails, setPlaceDetails] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  const [nearbyPlaces,setNearbyPlaces] = useState([]);
  const navigation = useNavigation();

  const placesRef = useRef(null);

  const route = useRoute();


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
      fetchNearbyPlaces(location.coords.latitude, location.coords.longitude);
    })();
  }, []);

  useEffect(() => {
    if(route.params?.placeName){
      setPlaceName(route.params.placeName);
    }
  },[route.params?.placeName]);

  useEffect(() => {
    if(route.params?.placeDetails){
      fetchWeather(route.params.placeDetails.geometry.location.lat, route.params.placeDetails.geometry.location.lng)
    }
  }, [route.params?.placeDetails]);
  

    const getUserId = () => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
  
    if (!userId) {
      console.error('User not authenticated');
      Alert.alert('Error', 'You must be logged in to perform this action');
      return null;
    }
  
    return userId;
  };

  useEffect(() => {
    if (route.params?.title) setTitle(route.params.title);
    if (route.params?.text) setText(route.params.text);
    if (route.params?.imageUri) setImageUri(route.params.imageUri);
    if (route.params?.placeName) setPlaceName(route.params.placeName);
    if (route.params?.placeDetails) setPlaceDetails(route.params.placeDetails);
  }, [route.params]);

  const pickImage = async () => {
    const options = [
      { text: "Take Photo", onPress: captureImage },
      { text: "Choose from Library", onPress: selectFromLibrary },
      { text: "Cancel", style: "cancel" }
    ];
    Alert.alert("Upload Image", "Choose an option", options);
  };

  const captureImage = async () => {
    try{
      let result = await ImagePicker.launchCameraAsync({
        quality: 1,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    }catch(error){
      console.log(error);
    }
  };

  const selectFromLibrary = async () => {
    try{
      let result = await ImagePicker.launchImageLibraryAsync({
        quality: 1,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    }catch(error){
      console.log(error);
    }
  };

  const fetchNearbyPlaces = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&type=point_of_interest&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      // console.log("here")
      if (data.results) {
        setNearbyPlaces(data.results.slice(0, 5));
        // console.log(data.results.slice(0,1));
      }
    } catch (error) {
      console.log("Error fetching nearby places: ", error);
    }
  };

  const renderNearbyLocationButtons = () => {
    return (
      <View style={styles.nearbyLocations}>
        {nearbyPlaces.map((place, index) => (
          <Pressable
            key={index}
            style={styles.locationButton}
            onPress={() => {
              setPlaceName(place.name);
              setPlaceDetails(place);
              fetchWeather(place.geometry.location.lat, place.geometry.location.lng);
            }}
          >
            <Text style={styles.locationButtonText}>{place.name}</Text>
          </Pressable>
        ))}
      </View>
    );
  };
  

  const fetchWeather = async (lat, lon) => {
    try{
      const response = await fetch(`${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
      const data = await response.json();
      if(data.weather){
        setWeatherData({
          temperature: data.main.temp,
          description: data.weather[0].description,
          icon: data.weather[0].icon
        });
      }else{
        console.log("weather data not found");
      }
    }catch(error){
      console.log("Error fetching weather data: ",error)
    }
  }

  const handleSubmit = async () => {
    if (!title || !text || !imageUri || !placeName) {
      alert("Please fill in all fields");
      return;
    }
    
    const userId = getUserId();
    
    const postId = shortid.generate();

    const location =new GeoPoint(placeDetails.geometry.location.lat, placeDetails.geometry.location.lng);

    await fetchWeather(placeDetails.geometry.location.lat, placeDetails.geometry.location.lng);

    const postData = {title, text, imageUri, placeName, location, postId, weather:weatherData};

  
    try {
      
      await addPost(userId, postId, postData);

      alert("Post submitted successfully");
      setTitle("");
      setText("");
      setImageUri(null);
      setPlaceName("");
      setPlaceDetails(null);
      setWeatherData(null);

      if (placesRef.current) {
        placesRef.current.clear();  
      }
    } catch (error) {
      alert("Error while submitting post");
      console.log(error);
    }
  };

  const goToNearbyLocations = () => {
    navigation.navigate('NearbyLocations',{
      title,
      text,
      imageUri,
      placeName,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View>
      <Text style={styles.title}>Create a New Post</Text>
      <Pressable onPress={pickImage} style={styles.imageContainer}>
        <Image
          source={imageUri ? { uri: imageUri } : require("../../assets/default-image.png")}
          style={imageUri? styles.uploadedImage : styles.imagePreview}
        />
        <Text style={styles.imageText}>Tap to upload an image</Text>
      </Pressable>

      <TextInput
        style={styles.titleInput}
        placeholder="Enter title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.textArea}
        placeholder="Enter description"
        multiline
        value={text}
        onChangeText={setText}
      />

      <Pressable onPress={goToNearbyLocations}>
        <View style={styles.locationContainer}>
          <View style={styles.subLocationContainer}>
            <Feather name="map-pin" size={15} color={"#313131"} />
            <Text style={styles.label}>Mark Location</Text>
          </View>
          <Feather name="chevron-right" size={18} color={"#313131"}/>
        </View>
      </Pressable>

      {/* {renderNearbyLocationButtons()} */}
      

      {placeName ? <Text style={styles.locationText}>{placeName}</Text> : (renderNearbyLocationButtons())}
      

      {weatherData && (
        <View style={styles.weatherContainer}>          
            <Feather name="sun" size={18} color={"#313131"}/>

            <Text style={styles.weatherText}>🌡️{weatherData.temperature}°C</Text>
            <Text style={styles.weatherText}>  {weatherData.description}</Text>
          
        </View>
      )}
      </View>
      
      <Pressable onPress={handleSubmit} style={styles.button}>
        <Text style={styles.buttonText}>Post</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor:"#eff2f9",
    justifyContent:"space-between"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    // fontFamily: "monospace",
    color: "black",
    paddingTop:50,
    textAlign:"center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 30,
  },
  imageText: {
    marginTop: 10,
    fontSize: 14,
    color: "#777",
  },
  titleInput:{
    fontSize:16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    borderColor: '#ccc',
    borderBottomWidth: 1,
  },
  locationText: {
    marginVertical: 10,
    fontSize: 15,
    fontWeight:"bold",
    color:"#313131",
    marginLeft:24,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
    // borderColor:"red",
    // borderWidth:1,
    borderRadius:15,
  },
  weatherContainer: {
    marginVertical: 10,
    flexDirection:"row",
   alignItems:"center",
  },
  weatherText: {
    fontSize: 14,
  },
  weatherIcon: {
    width: 30,
    height: 30,
    marginTop: 5,
    backgroundColor:"orange",
    borderRadius:15,
  },
  button:{
    borderColor:"black",
    borderWidth:1,
    width:"100%",
    alignSelf:"center",
    paddingVertical: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    backgroundColor:"white",
  },
  buttonText:{
    fontSize:14,
    textAlign:"center",
  },
  label:{
    color:"#313131",
    marginLeft:8,
    fontSize: 14,
  },
  locationContainer:{
    flexDirection:"row",
    marginTop:10,
    justifyContent:"space-between",
    alignItems:"center"
  },  
  subLocationContainer:{
    flexDirection:"row",
    alignItems:"center"
  },
  nearbyLocations: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  locationButton: {
    backgroundColor:"white",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  locationButtonText: {
    fontSize: 14,
    color: "#313131",
  },
  uploadedImage:{
    width: 200,
    height: 200,
    borderRadius: 30,
  }
});


