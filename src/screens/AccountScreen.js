import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Image, FlatList, Pressable, RefreshControl, ActivityIndicator } from "react-native";
import { getLikedPostsForUser, getPostsForUser,deletePost } from "../../firestoreService";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import Feather from "react-native-vector-icons/Feather";
import { Swipeable } from "react-native-gesture-handler";

export default function AccountScreen({ navigation }) {
  const [userData, setUserData] = useState(null); 
  const [userPosts, setUserPosts] = useState([]); 
  const [likedPosts, setLikedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('myPosts');

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No authenticated user found.");
        return;
      }

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      setUserData(userSnap.data());

      const posts = await getPostsForUser(currentUser.uid);
      setUserPosts(posts);

      const likedPostsData = await getLikedPostsForUser(currentUser.uid);
      setLikedPosts(likedPostsData);
    } catch (error) {
      console.error("Error fetching user data or posts:", error);
    } 
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const renderRightActions = (onDelete) => (
    <Pressable style={styles.deleteButton} onPress={onDelete}>
      <Text style={styles.deleteButtonText}>
        <Feather name="trash-2" size={25} color={"#313131"} />
      </Text>
    </Pressable>
  );

  const handleDeletePost = async (userId,postId) => {
    try {
      await deletePost(userId, postId); 
      setUserPosts((prevPosts) => prevPosts.filter((post) => post.postId !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = () => {
    fetchUserData(); 
  };

  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleSignOut}>
          <Feather name="log-out" size={25} color={"#313131"} />
        </Pressable>
      </View>
      {userData && (
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: userData.profilePhoto }}
            style={styles.profilePhoto}
          />
          <Text style={styles.username}>{userData.username}</Text>
        </View>
      )}
      
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tabButton, selectedTab === 'myPosts' && styles.selectedTab]}
          onPress={() => setSelectedTab('myPosts')}
        >
          <Text style={styles.tabText}>My Posts</Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, selectedTab === 'likedPosts' && styles.selectedTab]}
          onPress={() => setSelectedTab('likedPosts')}
        >
          <Text style={styles.tabText}>Liked Posts</Text>
        </Pressable>
      </View>
      
      {selectedTab === 'myPosts' ? (
        <>
          <FlatList
            data={userPosts}
            keyExtractor={(item) => item.postId}
            renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => renderRightActions(() => handleDeletePost(userData.userId,item.postId))}
            >
              <Pressable onPress={() => navigation.navigate("DetailPost", { post: item })} style={styles.postCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
                <View style={styles.overlay} />
                <Text style={styles.postTitle}>{item.title}</Text>
              </Pressable>
            </Swipeable>
            )}
            contentContainerStyle={styles.postsContainer}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
          />
        </>
      ) : (
        <>
          <FlatList
            data={likedPosts}
            keyExtractor={(item) => item.postId}
            renderItem={({ item }) => (
              <Pressable onPress={() => navigation.navigate("DetailPost", { post: item })} style={styles.postCard}>
                <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
                <View style={styles.overlay} />
                <Text style={styles.postTitle}>{item.title}</Text>
              </Pressable>
            )}
            contentContainerStyle={styles.postsContainer}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
          />
        </>
      )}

      {isLoading && <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 60,
    backgroundColor:"#eff2f9"
  },
  header:{
    flexDirection:"row",
    justifyContent:"flex-end",
    paddingRight:10,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 5,
    borderRadius: 20,
    borderColor:"#313131",
    borderWidth:1,
  },
  selectedTab: {
    backgroundColor: "#ACC2DD",
  },
  tabText: {
    fontSize: 14,
    // fontWeight: "bold",
  },
  postsContainer: {
    paddingVertical: 10,
  },
  postCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden", 
    position: "relative",
    height: 150, 
    width:"95%",
    alignSelf:"center",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 4,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  postTitle: {
    position: "absolute",
    bottom: 10,
    left: 10,
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  loadingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    backgroundColor: "#ACC2DD",
    borderRadius: 10,
    marginBottom: 20,
    marginLeft:-30,
  },
  deleteButtonText: {
   marginLeft:15,
  },
});



