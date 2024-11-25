import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch products from the API
  useEffect(() => {
    fetch("https://sersidw.pythonanywhere.com/marketplace")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false); // Stop loading after data fetch
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false); // Stop loading on error
      });
  }, []);

  // Render individual product
  const renderProduct = ({ item }) => {
    const mainImage =
      item.images && item.images.length > 0
        ? `https://sersidw.pythonanywhere.com/static/${item.images[0]}`
        : "https://sersidw.pythonanywhere.com/static/uploads/default.jpg";

    return (
      <TouchableOpacity style={styles.productCard}>
        <Image source={{ uri: mainImage }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category || "No Category"}</Text>
          <Text style={styles.productPrice}>${parseFloat(item.price).toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Marketplace</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : products.length === 0 ? (
        <Text style={styles.emptyMessage}>No products available.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.productID?.toString() || Math.random().toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: "#fff",
    marginBottom: 15,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 150,
  },
  productDetails: {
    padding: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "#555",
  },
});

export default Products;
