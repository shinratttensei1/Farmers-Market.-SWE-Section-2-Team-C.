import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from '../(auth)/api';

const Profile = () => {
  const [farmer, setFarmer] = useState(null);
  const [farms, setFarms] = useState([]);
  const [products, setProducts] = useState([]);
  const [farmAddress, setFarmAddress] = useState('');
  const [typesOfCrops, setTypesOfCrops] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');

  useEffect(() => {
    fetchUserData();
    fetchProducts();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedUserID = await AsyncStorage.getItem("userID");
      if (!storedUserID) {
        console.error("User ID not found in AsyncStorage");
        return;
      }
      const storedUserRole = await AsyncStorage.getItem("userRole");
      console.log(storedUserID);
      console.log(storedUserRole);
      const response = await api.get(`/profile/${storedUserID}`);
      console.log(response);
      const userData = response.data;
      console.log(userData);
  
      if (storedUserRole == 'farmer'){
        setFarmer(userData.farmer);
        setFarms(userData.farms);
        if (userData.farmer && userData.farmer.id) {
          fetchProducts(userData.farmer.id);
        } else {
          console.error("Farmer ID not found in user data");
        }
      }

    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchProducts = async (farmerID) => {
    try {
      if (!farmerID) {
        console.error("Farmer ID is undefined. Cannot fetch products.");
        return;
      }
      const response = await api.get(`/products/${farmerID}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error.response?.data || error.message);
    }
  };

  const handleAddFarm = async () => {
    if (!farmAddress || !typesOfCrops || !farmSize) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const farmerID = 36;
      const response = await api.post(`/add-farm/${farmerID}`, {
        farmAddress,
        typesOfCrops,
        farmSize: parseFloat(farmSize),
      });

      Alert.alert('Success', response.data.msg);
      setFarmAddress('');
      setTypesOfCrops('');
      setFarmSize('');
      fetchFarmerProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to add farm');
    }
  };

  const handleDeleteProduct = async (productID) => {
    try {
      await api.delete(`/delete-product/${productID}`);
      Alert.alert('Success', 'Product deleted successfully');
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  const startEditingProduct = (product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditQuantity(product.quantity.toString());
  };

  const handleUpdateProduct = async () => {
    if (!editName || !editPrice || !editQuantity) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await api.put(`/update-product/${editingProduct.id}`, {
        name: editName,
        price: parseFloat(editPrice),
        quantity: parseInt(editQuantity, 10),
      });
      Alert.alert('Success', 'Product updated successfully');
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      Alert.alert('Error', 'Failed to update product');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Farmer Profile Section */}
      {farmer && (
        <View style={styles.farmerContainer}>
          <Text style={styles.title}>Farmer Profile</Text>
          <Text style={styles.info}>Name: {farmer.name}</Text>
          <Text style={styles.info}>Email: {farmer.email}</Text>
          <Text style={styles.info}>Phone: {farmer.phonenumber}</Text>
          <Text style={styles.info}>Rating: {farmer.rating}</Text>
          <Text style={styles.info}>Resources: {farmer.resources}</Text>
        </View>
      )}

      {/* Farms Section */}
      <Text style={styles.sectionTitle}>Farms</Text>
      <FlatList
        data={farms}
        renderItem={({ item }) => (
          <View style={styles.farmContainer}>
            <Text style={styles.farmAddress}>Address: {item.farmAddress}</Text>
            <Text style={styles.farmDetails}>Crops: {item.typesOfCrops}</Text>
            <Text style={styles.farmDetails}>Size: {item.farmSize} acres</Text>
          </View>
        )}
        keyExtractor={(item) => item.farmID.toString()}
      />

      {/* Add Farm Section */}
      <View style={styles.addFarmContainer}>
        <Text style={styles.title}>Add a New Farm</Text>
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

      {/* Products Section */}
      <Text style={styles.sectionTitle}>Products</Text>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            {editingProduct && editingProduct.id === item.id ? (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Product Name"
                  value={editName}
                  onChangeText={setEditName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  value={editPrice}
                  onChangeText={setEditPrice}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Quantity"
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  keyboardType="numeric"
                />
                <Button title="Save Changes" onPress={handleUpdateProduct} />
                <Button title="Cancel" onPress={() => setEditingProduct(null)} color="red" />
              </View>
            ) : (
              <View>
                <Text style={styles.productName}>Name: {item.name}</Text>
                <Text style={styles.productCategory}>Category: {item.category}</Text>
                <Text style={styles.productPrice}>Price: ${item.price}</Text>
                <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
                <Button
                  title="Edit"
                  onPress={() => startEditingProduct(item)}
                />
                <Button
                  title="Delete"
                  onPress={() =>
                    Alert.alert('Confirm Delete', 'Are you sure you want to delete this product?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', onPress: () => handleDeleteProduct(item.id) },
                    ])
                  }
                  color="red"
                />
              </View>
            )}
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  farmerContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  info: { fontSize: 14, marginBottom: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15 },
  farmContainer: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  farmAddress: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  farmDetails: { fontSize: 14, color: '#555', marginBottom: 5 },
  addFarmContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  productContainer: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  productCategory: { fontSize: 14, color: '#555', marginBottom: 5 },
  productPrice: { fontSize: 14, color: '#333', marginBottom: 5 },
  productQuantity: { fontSize: 12, color: '#777', marginBottom: 5 },
});

export default Profile;