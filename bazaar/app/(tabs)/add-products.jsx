import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Picker } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { CustomButton, FormField } from "../../components";
import api from "../(auth)/api";

const AddProducts = () => {
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
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      const farmerID = 36; // Replace with dynamically fetched farmer ID if needed
      const response = await api.get(`/farmer/farms/${farmerID}`);
      if (response.status === 200) {
        setFarms(response.data.farms);
      } else {
        Alert.alert("Error", "Failed to load farms. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching farms:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to load farms.");
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
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    formData.append("farmID", selectedFarmID);
    images.forEach((image, index) => {
      formData.append("images", {
        uri: image.uri,
        name: image.name || `image_${index}.jpg`,
        type: image.type || "image/jpeg",
      });
    });

    try {
      setSubmitting(true);
      const response = await api.post("/marketplace/add-product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Success", response.data.msg);
      setForm({ farmerID: "", name: "", description: "", price: "", quantity: "", category: "" });
      setImages([]);
      setSelectedFarmID("");
    } catch (error) {
      console.error("Error adding product:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to add product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
