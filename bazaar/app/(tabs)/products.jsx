import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Button,
  StyleSheet,
  Picker,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedFarm, setSelectedFarm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [categories, setCategories] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const DEFAULT_IMAGE =
    "https://sersidw.pythonanywhere.com/static/uploads/default.jpg";

  useEffect(() => {
    console.log("Fetching products...");
    fetch("http://127.0.0.1:5000/marketplace")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched products data:", data);
        setProducts(data);
        setFilteredProducts(data);

        const uniqueFarms = [...new Set(data.map((product) => product.farmAddress))];
        setFarms(uniqueFarms);
        console.log("Fetched farms:", uniqueFarms);

        const uniqueCategories = [...new Set(data.map((product) => product.category))];
        setCategories(uniqueCategories);
        console.log("Fetched categories:", uniqueCategories);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    console.log("Applying filters and search...");
    let updatedProducts = [...products];

    if (searchQuery) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFarm) {
      updatedProducts = updatedProducts.filter(
        (product) => product.farmAddress === selectedFarm
      );
    }

    if (selectedCategory) {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (sortOrder === "asc") {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      updatedProducts.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(updatedProducts);
  }, [searchQuery, selectedFarm, selectedCategory, sortOrder]);

  const fetchUserData = async () => {
    try {
      const userID = await AsyncStorage.getItem("userID");
      setUserID(userID);
    } catch (error) {
      console.error("Error fetching userID from AsyncStorage:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const [buyerID, setUserID] = useState(null);

  const addToCart = (productID) => {
    const payload = { buyerID, productID };
    fetch("http://127.0.0.1:5000/marketplace/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add to cart");
        }
        return response.json();
      })
      .then((data) => {
        alert(data.msg);
      })
      .catch((error) => {
        alert("Failed to add to cart.");
      });
  };

  const renderProduct = ({ item }) => {
    const mainImage =
      item.images && item.images.length > 0 ? item.images[0] : DEFAULT_IMAGE;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => setSelectedProduct(item)}
      >
        <Image source={{ uri: mainImage }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category || "No Category"}</Text>
          <Text style={styles.productFarm}>Farm: {item.farmAddress || "Unknown"}</Text>
          <Text style={styles.productPrice}>${parseFloat(item.price).toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Marketplace</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by product name"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <Picker
        selectedValue={selectedFarm}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedFarm(itemValue)}
      >
        <Picker.Item label="All Farms" value="" />
        {farms.map((farmAddress, index) => (
          <Picker.Item key={index} label={farmAddress} value={farmAddress} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedCategory}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
      >
        <Picker.Item label="All Categories" value="" />
        {categories.map((category, index) => (
          <Picker.Item key={index} label={category} value={category} />
        ))}
      </Picker>

      <View style={styles.sortButtons}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortOrder("asc")}
        >
          <Text style={styles.sortButtonText}>Price: Low to High</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortOrder("desc")}
        >
          <Text style={styles.sortButtonText}>Price: High to Low</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : filteredProducts.length === 0 ? (
        <Text style={styles.emptyMessage}>No products found.</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.productID.toString()} // Using unique productID
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
        />
      )}

      {selectedProduct && (
        <Modal
          visible={!!selectedProduct}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedProduct(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Image
                source={{
                  uri: selectedProduct.images && selectedProduct.images.length > 0
                    ? selectedProduct.images[0]
                    : DEFAULT_IMAGE,
                }}
                style={styles.modalImage}
              />
              <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
              <Text style={styles.modalCategory}>
                {selectedProduct.category || "No Category"}
              </Text>
              <Text style={styles.modalDescription}>
                {selectedProduct.description || "No description available."}
              </Text>
              <Text style={styles.modalPrice}>
                Price: ${parseFloat(selectedProduct.price).toFixed(2)}
              </Text>
              <Button title="Close" onPress={() => setSelectedProduct(null)} />
              <Button
                title="Add to Cart"
                onPress={() => addToCart(selectedProduct.productID)}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingLeft: 8,
  },
  picker: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
  },
  sortButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sortButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 4,
    width: "45%",
  },
  sortButtonText: {
    color: "#fff",
    textAlign: "center",
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    padding: 16,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  productCategory: {
    color: "#555",
  },
  productFarm: {
    color: "#555",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007bff",
  },
  emptyMessage: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  modalImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalCategory: {
    fontSize: 16,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 8,
  },
});

export default Products;
