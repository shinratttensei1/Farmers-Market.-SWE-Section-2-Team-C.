import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  Picker,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    fetch("http://127.0.0.1:5000/marketplace")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);

        const uniqueFarms = [...new Set(data.map((product) => product.farmAddress))];
        setFarms(uniqueFarms);

        const uniqueCategories = [...new Set(data.map((product) => product.category))];
        setCategories(uniqueCategories);

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);

  // Handle search and filters
  useEffect(() => {
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

  // Render individual product
  const renderProduct = ({ item }) => {
    const mainImage =
      item.images && item.images.length > 0 ? item.images[0] : DEFAULT_IMAGE;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => setSelectedProduct(item)} // Set selected product for modal
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
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal for Product Details */}
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
                  uri:
                    selectedProduct.images && selectedProduct.images.length > 0
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
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    padding: 8,
    backgroundColor: "#fff",
  },
  sortButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  sortButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 5,
  },
  sortButtonText: {
    color: "#fff",
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
  productFarm: {
    fontSize: 14,
    color: "#555",
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
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    height: 200,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  modalCategory: {
    fontSize: 16,
    color: "#888",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  modalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 10,
  },
});

export default Products;
