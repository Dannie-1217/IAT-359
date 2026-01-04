import { db, storage } from "./firebaseConfig"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc,getDoc, getDocs, GeoPoint, increment, updateDoc, arrayUnion, arrayRemove, collectionGroup,query,where,deleteDoc } from "firebase/firestore";



export const addUser = async (userId, username, profilePhoto) => {
    try{
        const userRef = doc (db, "users", userId);
        await setDoc(userRef, {
            username,
            profilePhoto,
            likedPosts: [],
            likedPostOwners: [],
            userId,
        });
        console.log("User added successfully");
    }catch(error){
        console.log("Error adding user: ", error);
    }
}

export const addPost = async (userId, postId, postData) => {
    const { imageUri, title, text, location, imageName, placeName } = postData;
  
    try {

      const imageFileName = imageName || `${postId}_image.jpg`;
      const imageUrl = imageUri ? await uploadImage(imageUri, imageFileName) : null;
      const postRef = doc(collection(db, "users", userId, "posts"), postId);

      await setDoc(postRef, {
        userId,
        title,
        text,
        imageUrl,
        location, 
        createdAt: new Date(),
        likeCount: 0,
        postId,
        placeName,
        weather: {
            temperature: postData.weather.temperature,
            description: postData.weather.description,
            icon: postData.weather.icon
        },
      });
  
      console.log("Post added successfully");
    } catch (error) {
      console.log("Error adding post:", error);
      throw new Error("Failed to upload post");
    }
  };

const uploadImage = async (imageUri, imageName) => {

    try {
        const storageRef = ref(storage, `images/${imageName}`);
        const response = await fetch(imageUri);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob);

        const imageUrl = await getDownloadURL(storageRef);
        return imageUrl;
    } catch (error) {
        console.log("Error uploading image:", error);
        throw new Error("Failed to upload image");
    }
}


export const getAllUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      // console.log("Users Snapshot Size:", usersSnapshot.size); 
      if (usersSnapshot.empty) {
        console.log("No users found in Firestore.");
        return [];  
      }
      const usersList = usersSnapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data(), 
      }));
      // console.log("Fetched Users:", usersList); 
      return usersList;
    } catch (error) {
      console.error("Error fetching users:", error);
      return []; 
    }
  };
  
  export const getPostsForUser = async (userId) => {
    const userDocRef = doc(db, 'users', userId); 
    const postsSnapshot = await getDocs(collection(userDocRef, 'posts')); 
    // console.log(postsSnapshot);
    const posts = [];
    postsSnapshot.forEach(postDoc => {
      posts.push({
        postId: postDoc.id,
        ...postDoc.data(),  
        userId,
      });
    });
    // console.log(posts);
    return posts;
  };


export const getLikedPostsForUser = async (userId) => {
  try {
   
    const userDocRef = doc(db, "users", userId);
    const userSnap = await getDoc(userDocRef);

    const userData = userSnap.data();
    const likedPosts = userData?.likedPosts || []; 
    const likedPostOwners = userData?.likedPostOwners || []; 

    if (likedPosts.length === 0) {
      return [];
    }

 
    const postPromises = likedPosts.map(async (postId, index) => {
      const postOwnerUserId = likedPostOwners[index]; 
      try {
        
        const postRef = doc(db, `users/${postOwnerUserId}/posts`, postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          return { postId, ...postSnap.data() };
        } else {
          console.log(`Post ${postId} does not exist or has been deleted.`);
          return null; 
        }
      } catch (error) {
        console.error(`Error fetching post ${postId} from user ${postOwnerUserId}:`, error);
        return null; 
      }
    });


    const posts = await Promise.all(postPromises);
    // console.log("Fetched posts:", posts);

    return posts.filter((post) => post !== null);
  } catch (error) {
    console.error("Error fetching liked posts for user:", error);
    return []; 
  }
};


  export const updateLikeCount = async (userId, postId, incrementValue) => {
    try {
        const userRef = doc(db, "users", userId);
        const postRef = doc(userRef, "posts", postId);
        
        await updateDoc(postRef, {
            likeCount: increment(incrementValue),
        });
        // console.log(`Like count updated successfully by ${incrementValue}`);
    } catch (error) {
        console.log("Error updating like count:", error);
    }
  };

  export const addUserLikedPost = async (userId, postId, postOwnerUserId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      const currentLikedPostOwners = userDoc.exists() ? userDoc.data().likedPostOwners || [] : [];
      const updatedLikedPostOwners = [...currentLikedPostOwners, postOwnerUserId];
  
      await updateDoc(userRef, {
        likedPosts: arrayUnion(postId), 
        likedPostOwners: updatedLikedPostOwners, 
      });
  
      console.log(`Post ${postId} liked by user ${userId}`);
    } catch (error) {
      console.error("Error adding post to likedPosts: ", error);
      throw new Error("Failed to add post to likedPosts");
    }
  };
  

  export const fetchUserProfile = async (userId) => {
    try{
        const userDocRef = doc (db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        return userDoc.data();
    }catch(error){
        console.log(error);
        throw error;
    }
  };

  export const removeUserLikedPost = async (userId, postId, postOwnerUserId) => {
    try {
      const userRef = doc(db, "users", userId);
  
      // Step 1: Remove postId from likedPosts
      await updateDoc(userRef, {
        likedPosts: arrayRemove(postId), // Removes only one occurrence of postId
      });
  
      // Step 2: Fetch current likedPostOwners array
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const likedPostOwners = userData?.likedPostOwners || [];
  
      // Step 3: Remove only the first occurrence of postOwnerUserId
      const postOwnerIndex = likedPostOwners.indexOf(postOwnerUserId);
  
      if (postOwnerIndex !== -1) {
        // Remove one occurrence of postOwnerUserId
        likedPostOwners.splice(postOwnerIndex, 1); // Remove the first occurrence
  
        // Step 4: Update Firestore with the modified likedPostOwners array
        await updateDoc(userRef, {
          likedPostOwners: likedPostOwners,
        });
  
        console.log(`Post owner ${postOwnerUserId} removed from likedPosts for user ${userId}`);
      } else {
        console.log(`Post owner ${postOwnerUserId} not found in likedPostOwners for user ${userId}`);
      }
    } catch (error) {
      console.error("Error removing post from likedPosts: ", error);
      throw new Error("Failed to remove post from likedPosts");
    }
  };

  export const checkIfLiked = async (userId, postId) =>{
    try{
      const userDocRef = doc (db, 'users', userId);
      const userSnap = await getDoc(userDocRef);

      const userData = userSnap.data();
      //console.log(userData.likedPosts.includes(postId));
      return userData.likedPosts.includes(postId);
    }catch(error){
        console.log(error);
        return false;
    }
  }

  export const getPostLikeCount = async(userId, postId) => {
    try{
        const postRef = doc(collection(db, "users", userId, "posts"),postId);
        const postDoc = await getDoc(postRef);
        return postDoc.data().likeCount;
        
    }catch(error){
        console.log(error);
    }
  }

  export const deletePost = async (userId,postId) => {
    try{
      const postRef = doc(collection(db, "users", userId, "posts"),postId);
      await deleteDoc(postRef);
      // console.log(postId);
    }catch(error){
      console.log(error);
    }
  };


  

