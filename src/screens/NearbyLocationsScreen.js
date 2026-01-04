import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import { useNavigation,useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import Icon from "react-native-vector-icons/Ionicons";


const NearbyLocations = () => {
  const [searchText, setSearchText] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locations, setLocations] = useState([]); 
  const [nearbyPlaces, setNearbyPlaces] = useState([]); 
  const navigation = useNavigation();
  const route = useRoute();
  const { title, text, imageUri } = route.params || {};

 
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
      fetchNearbyPlaces(location.coords);
    })();
  }, []);


  const fetchNearbyPlaces = async (coords) => {
    if (!coords) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${coords.latitude},${coords.longitude}&radius=1500&key=AIzaSyAkeXN8_H477KHaIuMfwM_smLSduWsm9q8`
      );
      const data = await response.json();
      if (data.results) {
        setNearbyPlaces(data.results); 
      }
    } catch (error) {
      console.error('Error fetching nearby places:', error);
    }
  };

  const fetchLocations = async (query) => {
    if (!userLocation) return;
  
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&location=${userLocation.latitude},${userLocation.longitude}&radius=1500&key=AIzaSyAkeXN8_H477KHaIuMfwM_smLSduWsm9q8`
      );
      const data = await response.json();
      if (data.results) {
        setLocations(data.results);
        
        data.results.forEach(async (item) => {
          const placeDetailsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=AIzaSyAkeXN8_H477KHaIuMfwM_smLSduWsm9q8`
          );
          const placeDetailsData = await placeDetailsResponse.json();
          const placeDetails = placeDetailsData.result;
          
          if (placeDetails && placeDetails.formatted_address) {
            item.formatted_address = placeDetails.formatted_address;
          }
          
          setLocations(prevLocations => [...prevLocations]);
        });
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };
  

  const handleSearchChange = (text) => {
    setSearchText(text);
    if (text) {
      fetchLocations(text); 
    } else {
      setLocations([]);
      if (userLocation) {
        fetchNearbyPlaces(userLocation);
      }
    }
  };


  const handleItemClick = (item) => {
    navigation.navigate('NewPost', { 
        placeName: item.name,
        placeDetails:
          item,
          title,
          text,
          imageUri});
  };

  const handleBackPress = () => {
    navigation.goBack();
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>  
      <Pressable style={styles.backButton} onPress={handleBackPress}>
          <Icon name="chevron-back-outline" size={35} color="#919AA5" />
      </Pressable>
      <Text style={styles.title}>Search Locations</Text>
      </View>
      <View style={styles.searchBarContainer}>
        <Feather name="search" size={20} color="#313131" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a place"
          value={searchText}
          onChangeText={handleSearchChange}
        />
      </View>


      <FlatList
        data={searchText ? locations : nearbyPlaces}
        keyExtractor={(item, index) => item.place_id + index}
        renderItem={({ item }) => (
        <Pressable style={styles.locationItem} onPress={() => handleItemClick(item)}>
          <Text style={styles.locationName}>{item.name}</Text>
          <Text style={styles.locationDetails}>
            Address: {item.formatted_address ? item.formatted_address : 'Address not available'}
          </Text>
          {item.rating && <Text style={styles.locationDetails}>Rating: {item.rating} ⭐</Text>}
        </Pressable>
        )}
      
/>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#eff2f9',
  },
  header:{
    flexDirection:"row",
    justifyContent:"flex-start",
    paddingTop:60,
    alignItems:"center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color:"#313131",
    // fontFamily:"monospace",
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingRight: 10,
    borderRadius: 15,
    marginBottom: 10,
  },
  searchIcon: {
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 10,
    height: 40,
    fontSize: 16,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginLeft: 10,
  },
  locationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color:"#313131"
  },
  locationDetails: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
});

export default NearbyLocations;
