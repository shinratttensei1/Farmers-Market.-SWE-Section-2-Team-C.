import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker"; // Dropdown
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import axios from "axios";

export default function AddProductPage() {
  const router = useRouter();

  // State for form fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);

  // State for validation errors
  const [errors, setErrors] = useState({});

  // Function to handle form submission
  const handleSubmit = async () => {
    const isValid = validateInputs();

    if (!isValid) {
      Alert.alert("Validation Error", "Please fix the errors before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("description", description);

    images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        });
      });
    
      try {
        const response = await axios.post('http://localhost:3000/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert('Product added successfully!');
        resetForm();
      } catch (error) {
        alert('Error adding product.');
      }
  };

  // Function to reset form after successful submission
  const resetForm = () => {
    setName("");
    setCategory("");
    setPrice("");
    setQuantity("");
    setDescription("");
    setImages([]); // Clear images
    setErrors({}); // Clear validation errors
  };
  

  // Validation function
  const validateInputs = () => {
    const newErrors = {};

    if (!name) newErrors.name = "Name is required.";
    if (!category) newErrors.category = "Category is required.";
    if (!price || isNaN(price) || price <= 0) newErrors.price = "Invalid price.";
    if (!quantity || isNaN(quantity) || quantity <= 0) newErrors.quantity = "Invalid quantity.";
    if (!description) newErrors.description = "Description is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle image selection
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const resizedImages = await Promise.all(
        result.assets.map(async (image) => {
          const manipResult = await ImageManipulator.manipulateAsync(
            image.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          return manipResult;
        })
      );
      setImages((prevImages) => [...prevImages, ...resizedImages]);
    }
  };

  // Function to remove selected images
  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add New Product</Text>

      <TextInput
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select Category" value="" />
          <Picker.Item label="Vegetables" value="vegetables" />
          <Picker.Item label="Fruits" value="fruits" />
          <Picker.Item label="Seeds" value="seeds" />
        </Picker>
      </View>
      {errors.category && <Text style={styles.error}>{errors.category}</Text>}

      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        style={styles.input}
        keyboardType="numeric"
      />
      {errors.price && <Text style={styles.error}>{errors.price}</Text>}

      <TextInput
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        style={styles.input}
        keyboardType="numeric"
      />
      {errors.quantity && <Text style={styles.error}>{errors.quantity}</Text>}

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textarea]}
        multiline
      />
      {errors.description && <Text style={styles.error}>{errors.description}</Text>}

      <View style={styles.imagePickerContainer}>
        <TouchableOpacity onPress={handleImagePick} style={styles.imagePickerButton}>
          <Text style={styles.imagePickerText}>Select Images</Text>
        </TouchableOpacity>
        <ScrollView horizontal>
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <TouchableOpacity onPress={() => handleRemoveImage(index)}>
                <Text style={styles.removeImageText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitText}>Submit Product</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 5 },
  textarea: { height: 100 },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginBottom: 10 },
  picker: { height: 50, width: "100%" },
  error: { color: "red", marginBottom: 10 },
  imagePickerContainer: { marginBottom: 20 },
  imagePickerButton: { padding: 10, backgroundColor: "#3b82f6", borderRadius: 5 },
  imagePickerText: { color: "white", textAlign: "center" },
  imageContainer: { marginRight: 10 },
  imagePreview: { width: 100, height: 100, borderRadius: 5 },
  removeImageText: { color: "red", textAlign: "center" },
  submitButton: { backgroundColor: "#3b82f6", padding: 15, borderRadius: 5 },
  submitText: { color: "white", textAlign: "center", fontWeight: "bold" },
});
