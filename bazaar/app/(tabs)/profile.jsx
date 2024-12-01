import React, { useState, useEffect } from "react";
import { Link, router } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  Button,
  FlatList,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomButton, FormField } from "../../components";
import api from "../(auth)/api";
import { setStatusBarNetworkActivityIndicatorVisible } from "expo-status-bar";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [farms, setFarms] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verified, setIsVerified] = useState(true);

  const [farmAddress, setFarmAddress] = useState("");
  const [typesOfCrops, setTypesOfCrops] = useState("");
  const [farmSize, setFarmSize] = useState("");
  
  const [role, setRole] = useState(null);

  const [logged, setLogged] = useState(true);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImages, setProductImages] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const startEditingProduct = (product) => {
  setEditingProduct(product);
  setProductName(product.name);
  setProductCategory(product.category);
  setProductPrice(product.price.toString());
  setProductQuantity(product.quantity.toString());
  setProductDescription(product.description);
  setProductImages(product.images);
  setIsModalVisible(true);
};
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userID = await AsyncStorage.getItem("userID");
      const userRole = await AsyncStorage.getItem("userRole");
      console.log(userID);
      console.log(userRole);
      if (!userID) {
        Alert.alert("Error", "No user session found. Please log in.");
        setLoading(false);
        return;
      }
      setLogged(true);
      if (userRole == "farmer"){
        setRole("farmer");
        console.log(role);
        const response = await api.get(`/farmer/profile/${userID}`);
        const data = response.data;
        console.log(data);
        if (data.isVerified == 'false'){
          setIsVerified(false);
          setUser(data);
          setFarms([]);
        }
        else {
          setIsVerified(true);
          setUser(data);
        }
      }
      else if (userRole == "buyer"){
        setRole("buyer");
        const response = await api.get(`/buyer/profile/${userID}`);
        const data = response.data;
        setUser(data);
        console.log(data.userID);

      //   return jsonify({
      //     "name": user.name,
      //     "email": user.email,
      //     "phonenumber": user.phonenumber,
      //     "deliveryAddress": buyer.deliveryAddress,
      //     "paymentMethod": buyer.paymentMethod,
      // }), 200
      }
      else {
        setRole("guest");
      }

    } catch (error) {
      console.error("Error fetching farmer data:", error);
      Alert.alert("Error", "Failed to load farmer data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (farmerID) => {
    try {
      const response = await api.get(`http://127.0.0.1:5000/farmer/products/${farmerID}`);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Failed to load products.");
    }
  };

  const loginRedirect = async () => {
    router.replace('../(auth)/sign_in');
  }

  const logout = async () => {
    AsyncStorage.clear();
    router.replace('');
  }

 const handleAddFarm = async () => {
  if (!farmAddress || !typesOfCrops || !farmSize) {
    Alert.alert("Error", "Please fill in all fields.");
    return;
  }

  try {
    const farmerID = await AsyncStorage.getItem("userID");
    const response = await api.post(`/farmer/add-farm/${farmerID}`, {
      farmAddress,
      typesOfCrops,
      farmSize: parseFloat(farmSize),
    });

    Alert.alert("Success", response.data.msg);
    setFarmAddress("");
    setTypesOfCrops("");
    setFarmSize("");
    fetchUserData();
  } catch (error) {
    console.error("Error adding farm:", error);
    Alert.alert("Error", "Failed to add farm.");
  }
};

  const handleDeleteProduct = async (productID) => {
    try {
      await api.delete(`http://127.0.0.1:5000/farmer/delete-product/${productID}`);
      Alert.alert("Success", "Product deleted successfully.");
      fetchProducts(user.id);
    } catch (error) {
      console.error("Error deleting product:", error);
      Alert.alert("Error", "Failed to delete product.");
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    try {
      await api.put(`http://127.0.0.1:5000/farmer/update-product/${editingProduct.id}`, {
        name: productName,
        category: productCategory,
        price: parseFloat(productPrice),
        quantity: parseInt(productQuantity, 10),
        description: productDescription,
        images: productImages,
      });

      Alert.alert("Success", "Product updated successfully.");
      setIsModalVisible(false);
      setEditingProduct(null);
      fetchProducts(user.id);
    } catch (error) {
      console.error("Error updating product:", error);
      Alert.alert("Error", "Failed to update product.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading profile...</Text>
      </View>
    );
  }
  if (logged){
    if (role == "farmer"){
      if (verified){
        return (
          <ScrollView style={styles.container}>
            <View style={styles.profileContainer}>
              <Text style={styles.title}>Farmer Profile</Text>
              <Text style={styles.info}>Name: {user?.name || "Loading..."}</Text>
              <Text style={styles.info}>Email: {user?.email || "Loading..."}</Text>
              <Text style={styles.info}>Phone: {user?.phonenumber || "Loading..."}</Text>
              <CustomButton 
                title="Log Out"
                handlePress={logout}
                containerStyles="mt-7"
              />
            </View>
    
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farms</Text>
            <FlatList
              data={farms}
              keyExtractor={(item) => item.farmID.toString()}
              renderItem={({ item }) => (
                <View style={styles.farmCard}>
                  <Text style={styles.cardText}>Address: {item.farmAddress}</Text>
                  <Text style={styles.cardText}>Crops: {item.typesOfCrops}</Text>
                  <Text style={styles.cardText}>Size: {item.farmSize} acres</Text>
                </View>
              )}
          />
    
            <Text style={styles.subTitle}>Add a Farm</Text>
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
    
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Products</Text>
            <FlatList
              data={products}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.productCard}>
                  <Text style={styles.cardText}>Name: {item.name}</Text>
                  <Text style={styles.cardText}>Category: {item.category}</Text>
                  <Text style={styles.cardText}>Price: ${item.price}</Text>
                  <Text style={styles.cardText}>Quantity: {item.quantity}</Text>
                  <Button title="Edit" onPress={() => startEditingProduct(item)} />
                  <Button title="Delete" color="red" onPress={() => handleDeleteProduct(item.id)} />
                </View>
              )}
            />
    
    
            <Modal
              visible={isModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setIsModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Edit Product</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Product Name"
                    value={productName}
                    onChangeText={setProductName}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Category"
                    value={productCategory}
                    onChangeText={setProductCategory}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Price"
                    value={productPrice}
                    onChangeText={setProductPrice}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Quantity"
                    value={productQuantity}
                    onChangeText={setProductQuantity}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Description"
                    value={productDescription}
                    onChangeText={setProductDescription}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Images (URLs)"
                    value={productImages}
                    onChangeText={setProductImages}
                  />
                  <View style={styles.modalActions}>
                    <Button title="Save Changes" onPress={handleEditProduct} />
                    <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                      <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
        );
      }
    
      if (!verified){
        return (
          <ScrollView style={styles.container}>
          <View style={styles.profileContainer}>
            <Text style={styles.title}>Farmer Profile</Text>
            <Text style={styles.info}>Name: {user?.name || "Loading..."}</Text>
            <Text style={styles.info}>Email: {user?.email || "Loading..."}</Text>
            <Text style={styles.info}>Phone: {user?.phonenumber || "Loading..."}</Text>
          </View>
        </ScrollView>
        )
      }
    }
    else if (role == "buyer"){
      return (
        <ScrollView style={styles.container}>
        <View style={styles.profileContainer}>
          <Text style={styles.title}>Buyer Profile</Text>
          <Text style={styles.info}>Name: {user?.name || "Loading..."}</Text>
          <Text style={styles.info}>Email: {user?.email || "Loading..."}</Text>
          <Text style={styles.info}>Phone: {user?.phonenumber || "Loading..."}</Text>
          <Text style={styles.info}>Delivery Address: {user?.deliveryAddress || "Loading..."}</Text>
          <Text style={styles.info}>Payment Method: {user?.paymentMethod || "Loading..."}</Text>
          <CustomButton 
              title="Log Out"
              handlePress={logout}
              containerStyles="mt-7"
            />
        </View>
      </ScrollView>
      )
    }
  }

  return (
    <ScrollView style={styles.container}>
    <View style={styles.profileContainer}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.info}>Looks like you are not logged in.</Text>
      <CustomButton
          title="Proceed to login"
          handlePress={loginRedirect}
          containerStyles="mt-7"
        />
    </View>
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  profileContainer: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  subTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  farmCard: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  productCard: {
    backgroundColor: "#fefefe",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cardText: { fontSize: 14, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    color: "#007bff",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
});

export default Profile;
