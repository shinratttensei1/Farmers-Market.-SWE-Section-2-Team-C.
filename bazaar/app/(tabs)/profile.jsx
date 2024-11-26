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

const Profile = ({ userID, role }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const SERVER_URL = "https://sersidw.pythonanywhere.com/"; // Replace `192.168.x.x` with your local machine IP address

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const endpoint =
          role === "farmer"
            ? `${SERVER_URL}/farmer/profile/${userID}`
            : `${SERVER_URL}/buyer/profile/${userID}`;

        console.log("Fetching profile data from:", endpoint);

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Profile data fetched successfully:", data);

        setProfileData(data);
      }
      finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userID, role]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  if (!profileData) {
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        {role === "farmer" ? "Farmer Profile" : "Buyer Profile"}
      </Text>
      <Image
        source={{ uri: profileImageUrl || "https://via.placeholder.com/150" }}
        style={styles.profileImage}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Name:</Text> {profileData.name}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Email:</Text> {profileData.email}
        </Text>
        <Text style={styles.infoText}>
          <Text style={styles.label}>Phone:</Text> {profileData.phonenumber}
        </Text>
        {role === "farmer" && (
          <>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Government ID:</Text>{" "}
              {profileData.govermentIssuedID}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Resources:</Text>{" "}
              {profileData.resources}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Rating:</Text>{" "}
              {profileData.rating || "Not Rated"}
            </Text>
          </>
        )}
        {role === "buyer" && (
          <>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Delivery Address:</Text>{" "}
              {profileData.deliveryAddress}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Payment Method:</Text>{" "}
              {profileData.paymentMethod}
            </Text>
          </>
        )}
      </View>
      {role === "farmer" && (
        <Button
          title="Add Farm"
          onPress={() => console.log("Navigate to Add Farm Page")}
          color="#28a745"
        />
      )}
    </SafeAreaView>
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
