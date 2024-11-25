import { useState, useEffect } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import api from '../(auth)/api';

const AddProducts = () => {

    const [isSubmitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        category: "",
        description: "",
        price: "",
        quantity: "",
        farmerID: 29,
        //FarmerTest 123
    });

    const submit = async () => {
        if (form.name === "" ||
            form.category === "" ||
            form.description === "" ||
            form.price === "" ||
            form.quantity === ""
        ) {
            alert("Please fill in all fields.");
            return;
        }
        
        setSubmitting(true);
        
        try {
            const payload = setForm;
            const response = await api.post('/marketplace/add-product', payload);
            Alert.alert('Success', response.data.msg);
            alert("Product successfully added!");
            // router.replace('/profile');
        } catch (error) {
            console.error('Marketplace:', error.response?.data || error.message);
            Alert.alert('Error', error.response?.data?.error || 'Something went wrong!');
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
                className="text-black-300"
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
                    title="Add Product"
                    handlePress={submit}
                    containerStyles="mt-7"
                    isLoading={isSubmitting}
                />
                </View>
            </ScrollView>
    </SafeAreaView>
  )
}

export default AddProducts