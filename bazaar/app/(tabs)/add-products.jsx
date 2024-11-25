import { useState, useEffect } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";
import { launchImageLibrary } from 'react-native-image-picker';
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker"; 
import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import api from '../(auth)/api';

const AddProducts = () => {

    const [images, setImages] = useState([]);
    const [isSubmitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
        farmerID: 36,
        category: "",
        //FarmerTest 123
    });

    const selectImages = async () => {
        try {
          const result = await launchImageLibrary(
            {
              mediaType: 'photo',
              selectionLimit: 5,
              quality: 1,
            },
            (response) => {
              if (response.didCancel) {
                console.log("User cancelled image selection.");
              } else if (response.errorCode) {
                console.error("ImagePicker Error:", response.errorMessage);
              } else {
                const selectedImages = response.assets.map((asset) => ({
                  uri: asset.uri,
                  name: asset.fileName || `image_${Date.now()}.jpg`,
                  type: asset.type || 'image/jpeg',
                }));
      
                setImages((prevImages) => [...prevImages, ...selectedImages].slice(0, 5)); // Limit to 5
              }
            }
          );
        } catch (error) {
          console.error("Error selecting images:", error.message);
        }
      };
    
      const Submit = async () => {
        const requiredFields = ["name", "description", "price", "quantity", "farmerID", "category"];
        for (const field of requiredFields) {
          if (!form[field]) {
            alert(`Please fill in the ${field} field.`);
            return;
          }
        }
      
        const formData = new FormData();
      
        Object.keys(form).forEach((key) => {
          formData.append(key, form[key]);
        });
      
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
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          Alert.alert("Success", response.data.msg);
      
          setForm({
            name: "",
            description: "",
            price: "",
            quantity: "",
            farmerID: 36,
            category: "",
          });
          setImages([]);
        } catch (error) {
          console.error("Error submitting product:", error.response?.data || error.message);
          Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
          setSubmitting(false);
        }
    };

    return (
        <SafeAreaView
        className="bg-black-200 h-full"
        >
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
                
                <Image
                source={images.bazaar_logo}
                resizeMode="center"
                />

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
                <FormField
                title="Product Name"
                value={form.name}
                handleChangeText={(e) => setForm({ ...form, name: e })}
                otherStyles="mt-7"
                />

                <FormField
                    title="Category"
                    value={form.category}
                    handleChangeText={(e) => setForm({ ...form, category: e })}
                    otherStyles="mt-7"
                />

                <FormField
                    title="Description"
                    value={form.description}
                    handleChangeText={(e) => setForm({ ...form, description: e })}
                    otherStyles="mt-7"
                />

                <FormField
                    title="Price"
                    value={form.price}
                    handleChangeText={(e) => setForm({ ...form, price: e })}
                    otherStyles="mt-7"
                />

                <FormField
                    title="Quantity"
                    value={form.quantity}
                    handleChangeText={(e) => setForm({ ...form, quantity: e })}
                    otherStyles="mt-7"
                />

                <CustomButton
                    title="Select Images"
                    handlePress={selectImages}
                    containerStyles="mt-7"
                    isLoading={isSubmitting}
                />

                <CustomButton
                    title="Add Product"
                    handlePress={Submit}
                    containerStyles="mt-7"
                    isLoading={isSubmitting}
                />
                </View>
            </ScrollView>
    </SafeAreaView>
  )
}

export default AddProducts