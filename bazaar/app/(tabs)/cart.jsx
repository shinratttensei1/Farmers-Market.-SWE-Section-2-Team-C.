import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyerID, setBuyerID] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [localCart, setLocalCart] = useState([]);  // For storing local cart quantities

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userID = await AsyncStorage.getItem("userID");
        setBuyerID(userID);
      } catch (error) {
        console.error("Error fetching userID from AsyncStorage:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!buyerID) return;

    setIsLoading(true);
    setError(null);

    // Fetch cart data from the backend
    const cartUrl = `http://127.0.0.1:5000/marketplace/cart/${buyerID}`;
    fetch(cartUrl)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Initialize local cart with the user-selected quantity
          const updatedCart = data.map(item => ({
            ...item,
            cartQuantity: item.cartQuantity > 0 ? item.cartQuantity : 1,  // Initialize to 1 if undefined
          }));
          setCartItems(updatedCart);
          setLocalCart(updatedCart);  // Store the local cart for quantity management
        } else {
          throw new Error("Cart data is not in expected format");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching cart items:", error);
        setError("Error loading cart. Please try again later.");
        setIsLoading(false);
      });
  }, [buyerID]);

  const removeItemFromCart = (productID) => {
    setRemovingItem(productID);

    const removeUrl = "http://127.0.0.1:5000/marketplace/cart/remove";
    fetch(removeUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ buyerID, productID }),
    })
      .then((response) => response.json())
      .then(() => {
        setCartItems((prevItems) => prevItems.filter((item) => item.productID !== productID));
        setRemovingItem(null);
      })
      .catch(() => {
        setRemovingItem(null);
        setError("Failed to remove item. Please try again.");
      });
  };

  // Update the quantity locally when the user changes the input
  const updateQuantityLocally = (productID, newQuantity) => {
    setLocalCart((prevCart) =>
      prevCart.map((item) =>
        item.productID === productID ? { ...item, cartQuantity: Math.max(1, newQuantity) } : item
      )
    );
  };

  const calculateTotalCost = () => {
    // Use the user-selected quantity (cartQuantity) for price calculation
    return localCart.reduce((total, item) => total + item.price * item.cartQuantity, 0).toFixed(2);
  };

  const updateCartOnBackend = () => {
    const updateUrl = "http://127.0.0.1:5000/cart/update_quantity";
    localCart.forEach((item) => {
      fetch(updateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyerID,
          productID: item.productID,
          quantity: item.cartQuantity,  // Send user-selected quantity
        }),
      }).catch(() => {
        setError("Failed to update quantity. Please try again.");
      });
    });
  };

  const createOrder = () => {
    const orderUrl = "http://127.0.0.1:5000/marketplace/order";
    const totalCost = calculateTotalCost();

    fetch(orderUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        buyerID,
        totalPrice: totalCost,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.orderID) {
          alert(`Order created successfully! Order ID: ${data.orderID}`);
          setCartItems([]);  // Clear cart after successful order
          setLocalCart([]);
        } else {
          setError(data.error || "Error creating order.");
        }
      })
      .catch(() => {
        setError("Error creating order. Please try again later.");
      });
  };

  const renderCartItem = ({ item }) => {
    const mainImage = item.images && item.images.length > 0 ? item.images[0] : null;

    return (
      <View style={styles.cartItem}>
        {mainImage ? (
          <Image source={{ uri: mainImage }} style={styles.itemImage} />
        ) : (
          <View style={styles.itemImageFallback}>
            <Text>No Image</Text>
          </View>
        )}
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>${parseFloat(item.price).toFixed(2)}</Text>
          <Text style={styles.itemQuantity}>Available: {item.quantity}</Text>

          {/* Quantity Controls */}
          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={() => updateQuantityLocally(item.productID, item.cartQuantity - 1)}
            >
              <Text style={styles.quantityButton}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.quantityInput}
              keyboardType="numeric"
              value={String(item.cartQuantity)}
              onChangeText={(text) =>
                updateQuantityLocally(item.productID, Math.max(1, parseInt(text) || 1))
              }
            />
            <TouchableOpacity
              onPress={() => updateQuantityLocally(item.productID, item.cartQuantity + 1)}
            >
              <Text style={styles.quantityButton}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Remove Button */}
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItemFromCart(item.productID)}
            disabled={removingItem === item.productID}
          >
            {removingItem === item.productID ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.removeButtonText}>Remove</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <Text style={styles.loadingText}>Loading cart...</Text>;
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      {localCart.length > 0 ? (
        <>
          <FlatList
            data={localCart}
            keyExtractor={(item) => item.productID.toString()}
            renderItem={renderCartItem}
          />
          <Text style={styles.totalCost}>Total: ${calculateTotalCost()}</Text>

          {/* Update Button */}
          <TouchableOpacity
            style={styles.updateButton}
            onPress={updateCartOnBackend}
          >
            <Text style={styles.updateButtonText}>Update Cart</Text>
          </TouchableOpacity>

          {/* Order Button */}
          <TouchableOpacity
            style={styles.orderButton}
            onPress={createOrder}
          >
            <Text style={styles.orderButtonText}>Place Order</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.emptyCart}>Your cart is empty.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
    alignItems: "center",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemImageFallback: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: 16,
    color: "#888",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#777",
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  quantityButton: {
    fontSize: 20,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityInput: {
    width: 40,
    textAlign: "center",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 5,
  },
  removeButton: {
    backgroundColor: "#FF6347",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    color: "red",
    marginTop: 20,
  },
  totalCost: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "right",
  },
  updateButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  orderButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  orderButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyCart: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
});

export default Cart;
