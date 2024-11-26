import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../(auth)/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [roleDetails, setRoleDetails] = useState(null); // Role-specific details
  const [loading, setLoading] = useState(true);

  // Farm addition states
  const [farmAddress, setFarmAddress] = useState("");
  const [typesOfCrops, setTypesOfCrops] = useState("");
  const [farmSize, setFarmSize] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch userID from AsyncStorage
      const storedUserID = await AsyncStorage.getItem("userID");
      if (!storedUserID) {
        Alert.alert("Error", "No user session found. Please log in.");
        setLoading(false);
        return;
      }

      // Fetch the user's role dynamically
      const roleResponse = await api.get(`http://127.0.0.1:5000/user/${storedUserID}`);
      if (roleResponse.status !== 200 || !roleResponse.data.role) {
        throw new Error("Failed to fetch user role.");
      }

      const userRole = roleResponse.data.role;

      // Fetch common user details
      const userResponse = await api.get(
        `http://127.0.0.1:5000/${userRole}/profile/${storedUserID}`
      );

      if (userResponse.status !== 200) {
        throw new Error(`Failed to fetch profile. Status code: ${userResponse.status}`);
      }

      const userData = userResponse.data;
      setUser({ ...userData, role: userRole });

      // Fetch role-specific details
      if (userRole === "farmer") {
        const farmerResponse = await api.get(
          `http://127.0.0.1:5000/farmer/profile/${storedUserID}`
        );
        if (farmerResponse.status === 200) {
          setRoleDetails(farmerResponse.data);
        } else {
          console.error("Failed to fetch farmer details.");
        }
      } else if (userRole === "buyer") {
        const buyerResponse = await api.get(
          `http://127.0.0.1:5000/buyer/details/${storedUserID}`
        );
        if (buyerResponse.status === 200) {
          setRoleDetails(buyerResponse.data);
        } else {
          console.error("Failed to fetch buyer details.");
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load user information.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarm = async () => {
    if (!farmAddress || !typesOfCrops || !farmSize) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      const storedUserID = await AsyncStorage.getItem("userID");
      const response = await api.post(`/farmer/add-farm/${storedUserID}`, {
        farmAddress,
        typesOfCrops,
        farmSize: parseFloat(farmSize),
      });

      if (response.status === 201) {
        Alert.alert("Success", response.data.msg);
        setFarmAddress("");
        setTypesOfCrops("");
        setFarmSize("");
      } else {
        throw new Error("Failed to add farm.");
      }
    } catch (error) {
      console.error("Error adding farm:", error);
      Alert.alert("Error", "Failed to add farm. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading user information...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load user information.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <Text style={styles.title}>User Profile</Text>
        <Text style={styles.info}>Name: {user.name}</Text>
        <Text style={styles.info}>Email: {user.email}</Text>
        <Text style={styles.info}>Phone: {user.phonenumber}</Text>
        <Text style={styles.info}>Role: {user.role}</Text>
      </View>

      {/* Role-Specific Details */}
      {roleDetails && user.role === "farmer" && (
        <View style={styles.roleDetailsContainer}>
          <Text style={styles.title}>Farmer Details</Text>
          <Text style={styles.info}>
            Government ID: {roleDetails.govermentIssuedID}
          </Text>
          <Text style={styles.info}>Resources: {roleDetails.resources}</Text>
          <Text style={styles.info}>Rating: {roleDetails.rating || "Not Rated"}</Text>

          {/* Add Farm Section */}
          <View style={styles.addFarmContainer}>
            <Text style={styles.sectionTitle}>Add a New Farm</Text>
            <TextInput
              style={styles.input}
              placeholder="Farm Address"
              value={farmAddress}
              onChangeText={setFarmAddress}
            />
            <TextInput
              style={styles.input}
              placeholder="Types of Crops"
              value={typesOfCrops}
              onChangeText={setTypesOfCrops}
            />
            <TextInput
              style={styles.input}
              placeholder="Farm Size (acres)"
              value={farmSize}
              onChangeText={setFarmSize}
              keyboardType="numeric"
            />
            <Button title="Add Farm" onPress={handleAddFarm} />
          </View>
        </View>
      )}

      {roleDetails && user.role === "buyer" && (
        <View style={styles.roleDetailsContainer}>
          <Text style={styles.title}>Buyer Details</Text>
          <Text style={styles.info}>
            Delivery Address: {roleDetails.deliveryAddress}
          </Text>
          <Text style={styles.info}>
            Payment Method: {roleDetails.paymentMethod}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  profileContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleDetailsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addFarmContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  info: { fontSize: 16, marginBottom: 5 },
  errorText: { fontSize: 18, color: "red", textAlign: "center", marginBottom: 10 },
});

export default Profile;
