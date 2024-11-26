import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = ({ userID, role }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const SERVER_URL = "https://sersidw.pythonanywhere.com/";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserID = await AsyncStorage.getItem("userID");
        if (storedUserID) {
          setUserID(storedUserID);

          // Fetch user-specific data using the userID
          const response = await api.get(`/users/${storedUserID}`); // Adjust endpoint as needed
          setUserData(response.data);
        } else {
          console.error("User ID not found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Unable to load profile data.</Text>
      </SafeAreaView>
    );
  }

  const profileImageUrl =
    profileData.profilePicture?.startsWith("http")
      ? profileData.profilePicture
      : `${SERVER_URL}/static/uploads/${profileData.profilePicture}`;

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.title}>
//         {role === "farmer" ? "Farmer Profile" : "Buyer Profile"}
//       </Text>
//       <Image
//         source={{ uri: profileImageUrl || "https://via.placeholder.com/150" }}
//         style={styles.profileImage}
//       />
//       <View style={styles.infoContainer}>
//         <Text style={styles.infoText}>
//           <Text style={styles.label}>Name:</Text> {profileData.name}
//         </Text>
//         <Text style={styles.infoText}>
//           <Text style={styles.label}>Email:</Text> {profileData.email}
//         </Text>
//         <Text style={styles.infoText}>
//           <Text style={styles.label}>Phone:</Text> {profileData.phonenumber}
//         </Text>
//         {role === "farmer" && (
//           <>
//             <Text style={styles.infoText}>
//               <Text style={styles.label}>Government ID:</Text>{" "}
//               {profileData.govermentIssuedID}
//             </Text>
//             <Text style={styles.infoText}>
//               <Text style={styles.label}>Resources:</Text>{" "}
//               {profileData.resources}
//             </Text>
//             <Text style={styles.infoText}>
//               <Text style={styles.label}>Rating:</Text>{" "}
//               {profileData.rating || "Not Rated"}
//             </Text>
//           </>
//         )}
//         {role === "buyer" && (
//           <>
//             <Text style={styles.infoText}>
//               <Text style={styles.label}>Delivery Address:</Text>{" "}
//               {profileData.deliveryAddress}
//             </Text>
//             <Text style={styles.infoText}>
//               <Text style={styles.label}>Payment Method:</Text>{" "}
//               {profileData.paymentMethod}
//             </Text>
//           </>
//         )}
//       </View>
//       {role === "farmer" && (
//         <Button
//           title="Add Farm"
//           onPress={() => console.log("Navigate to Add Farm Page")}
//           color="#28a745"
//         />
//       )}
//     </SafeAreaView>
//   );
// };

return (
  <View style={styles.container}>
    <Text style={styles.title}>Profile</Text>
    <Text style={styles.label}>User ID:</Text>
    <Text style={styles.value}>{userID}</Text>
    <Text style={styles.label}>Name:</Text>
    <Text style={styles.value}>{userData.name}</Text>
    <Text style={styles.label}>Email:</Text>
    <Text style={styles.value}>{userData.email}</Text>
    <Text style={styles.label}>Role:</Text>
    <Text style={styles.value}>{userData.role}</Text>
  </View>
);
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    color: "#ff0000",
    textAlign: "center",
  },
});
