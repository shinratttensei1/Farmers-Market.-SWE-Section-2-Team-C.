import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, TextInput, Picker, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered products
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // For name search
  const [farmLocationQuery, setFarmLocationQuery] = useState(""); // For farm location search
  const [selectedCategory, setSelectedCategory] = useState(""); // Dropdown for categories
  const [sortOrder, setSortOrder] = useState(""); // "asc" or "desc"
  const [categories, setCategories] = useState([]); // Dynamic category list

  // Fetch products and categories from the API
  useEffect(() => {
    fetch("http://127.0.0.1:5000/")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data); // Initialize filtered products

        // Extract unique categories from products
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

    // Filter by name search query
    if (searchQuery) {
      updatedProducts = updatedProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by farm location
    if (farmLocationQuery) {
      updatedProducts = updatedProducts.filter((product) =>
        product.location.toLowerCase().includes(farmLocationQuery.toLowerCase())
      );
    }

    // Filter by selected category
    if (selectedCategory) {
      updatedProducts = updatedProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Sort by price
    if (sortOrder === "asc") {
      updatedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      updatedProducts.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(updatedProducts);
  }, [searchQuery, farmLocationQuery, selectedCategory, sortOrder]);

  // Render individual product
  const renderProduct = ({ item }) => {
    const mainImage =
      item.images && item.images.length > 0
        ? item.images[0]
        : "https://sersidw.pythonanywhere.com/static/uploads/default.jpg";

    return (
      <TouchableOpacity style={styles.productCard}>
        <Image source={{ uri: mainImage }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category || "No Category"}</Text>
          <Text style={styles.productLocation}>Farm: {item.location || "Unknown"}</Text>
          <Text style={styles.productPrice}>${parseFloat(item.price).toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Marketplace</Text>

      {/* Search by Name */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by product name"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Search by Farm Location */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by farm location"
        value={farmLocationQuery}
        onChangeText={setFarmLocationQuery}
      />

      {/* Filter by Category (Dropdown) */}
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

      {/* Sort by Price */}
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

      {/* Product List */}
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
  productLocation: {
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
});

export default Products;
