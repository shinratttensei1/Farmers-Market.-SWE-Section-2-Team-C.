import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Picker, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { launchImageLibrary } from "react-native-image-picker"; // Install this library if not already
import { CustomButton, FormField } from "../../components";
import api from "../(auth)/api";

const AddProducts = () => {
  const [farmerID, setFarmerID] = useState(null);
  const [isFetchingID, setIsFetchingID] = useState(true);
  const [images, setImages] = useState([]);
  const [isSubmitting, setSubmitting] = useState(false);
  const [farms, setFarms] = useState([]);
  const [selectedFarmID, setSelectedFarmID] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
  });

  useEffect(() => {
    const fetchFarmerID = async () => {
      try {
        const storedFarmerID = await AsyncStorage.getItem("userID");
        if (!storedFarmerID) {
          Alert.alert("Error", "No farmer session found. Please log in.");
          setIsFetchingID(false);
          return;
        }
        setFarmerID(storedFarmerID);
        await fetchFarms(storedFarmerID);
      } catch (error) {
        console.error("Error fetching farmer ID:", error.message);
        Alert.alert("Error", "Failed to load farmer ID. Please try again.");
      } finally {
        setIsFetchingID(false);
      }
    };

    fetchFarmerID();
  }, []);

  const fetchFarms = async (farmerID) => {
    try {
      const response = await api.get(`/farmer/farms/${farmerID}`);
      if (response.status === 200) {
        setFarms(response.data.farms);
      } else {
        Alert.alert("Error", "Failed to load farms.");
      }
    } catch (error) {
      console.error("Error fetching farms:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to load farms.");
    }
  };

  const pickImages = async () => {
    try {
      const result = await launchImageLibrary({
        mediaTypes: "photo",
        selectionLimit: 0, // Allows multiple selection
        includeBase64: false,
        quality: 1,
      });

      if (!result.didCancel && result.assets) {
        setImages([...images, ...result.assets]);
      }
    } catch (error) {
      console.error("Error picking images:", error.message);
      Alert.alert("Error", "Failed to select images. Please try again.");
    }
  };

  const Submit = async () => {
    if (!form.name || !form.description || !form.price || !form.quantity || !form.category) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    if (!selectedFarmID) {
      Alert.alert("Error", "Please select a farm.");
      return;
    }

    const formData = new FormData();
    formData.append("farmerID", farmerID);
    formData.append("farmID", selectedFarmID);
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("price", form.price);
    formData.append("quantity", form.quantity);
    formData.append("description", form.description);

    images.forEach((image, index) => {
      formData.append("images", {
        uri: image.uri,
        name: `image_${index}.jpg`,
        type: image.type || "image/jpeg",
      });
    });

    try {
      setSubmitting(true);
      const response = await api.post("/marketplace/add-product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Success", response.data.msg);
      setForm({ name: "", description: "", price: "", quantity: "", category: "" });
      setImages([]);
      setSelectedFarmID("");
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to add product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isFetchingID) {
    return (
      <SafeAreaView>
        <View>
          <Text>Loading Farmer ID...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!farmerID) {
    return (
      <SafeAreaView>
        <View>
          <Text>Error: No Farmer ID Found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-black-200 h-full">
      <ScrollView>
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            height: "100%",
            paddingHorizontal: 16,
            marginVertical: 24,
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: "white",
              marginTop: 40,
              fontFamily: "Poppins-SemiBold",
            }}
          >
            Add New Product
          </Text>

          {/* Farm Picker */}
          <View style={{ marginVertical: 10 }}>
            <Text style={{ color: "white", fontSize: 16, marginBottom: 5 }}>Select Farm</Text>
            <Picker
              selectedValue={selectedFarmID}
              onValueChange={(itemValue) => setSelectedFarmID(itemValue)}
              style={{
                backgroundColor: "white",
                borderRadius: 5,
                padding: 10,
              }}
            >
              <Picker.Item label="Select a Farm" value="" />
              {farms.map((farm) => (
                <Picker.Item key={farm.farmID} label={farm.farmAddress} value={farm.farmID} />
              ))}
            </Picker>
          </View>

          {/* Product Fields */}
          <FormField
            title="Product Name"
            value={form.name}
            handleChangeText={(e) => setForm({ ...form, name: e })}
          />
          <FormField
            title="Category"
            value={form.category}
            handleChangeText={(e) => setForm({ ...form, category: e })}
          />
          <FormField
            title="Description"
            value={form.description}
            handleChangeText={(e) => setForm({ ...form, description: e })}
          />
          <FormField
            title="Price"
            value={form.price}
            handleChangeText={(e) => setForm({ ...form, price: e })}
          />
          <FormField
            title="Quantity"
            value={form.quantity}
            handleChangeText={(e) => setForm({ ...form, quantity: e })}
          />

          {/* Image Picker */}
          <View style={{ marginVertical: 10 }}>
            <Text style={{ color: "white", fontSize: 16, marginBottom: 5 }}>Add Images</Text>
            <TouchableOpacity onPress={pickImages} style={{ backgroundColor: "#ccc", padding: 10, borderRadius: 5 }}>
              <Text style={{ color: "black", textAlign: "center" }}>Select Images</Text>
            </TouchableOpacity>
            <ScrollView horizontal style={{ marginTop: 10 }}>
              {images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image.uri }}
                  style={{ width: 100, height: 100, marginRight: 10, borderRadius: 5 }}
                />
              ))}
            </ScrollView>
          </View>

          {/* Submit */}
          <CustomButton
            title="Add Product"
            handlePress={Submit}
            isLoading={isSubmitting}
            containerStyles="mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddProducts;
