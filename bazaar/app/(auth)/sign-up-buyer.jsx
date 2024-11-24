import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import api from './api';

const SignUpB = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    login: "",
    email: "",
    password: "",
    phonenumber: "",
    name: "",
    deliveryAddress: "",
    paymentMethod: "",
    // Add droplist for payment method
  });

  const submit = async () => {
    // console.log(api);
    if (
      form.login === "" ||
      form.email === "" ||
      form.password === "" ||
      form.phonenumber === "" ||
      form.name === "" ||
      form.deliveryAddress === "" ||
      form.paymentMethod === ""
    ) {
      alert("Please fill in all fields.");
      return;
    }
    // add other checks later like password length etc
    setSubmitting(true);
    try {
      const response = await api.post('/buyer/register', form);
      Alert.alert('Success', response.data.msg);
      router.replace("/profile");
    } catch (error) {
      Alert.alert('Error', 'Something went wrong!');
    }
    finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
     className="bg-black-200 h-full">
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Image
            source={images.bazaar_logo}
            resizeMode="contain"
          />

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold">
            Sign Up as a <u>buyer</u>
          </Text>

          <FormField
            title="Username"
            value={form.login}
            handleChangeText={(e) => setForm({ ...form, login: e })}
            otherStyles="mt-10"
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Name and Surname"
            value={form.name}
            handleChangeText={(e) => setForm({ ...form, name: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />
          
          <FormField
            title="Phone Number"
            value={form.phonenumber}
            handleChangeText={(e) => setForm({ ...form, phonenumber: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Delivery Address"
            value={form.deliveryAddress}
            handleChangeText={(e) => setForm({ ...form, deliveryAddress: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Payment Method"
            value={form.paymentMethod}
            handleChangeText={(e) => setForm({ ...form, paymentMethod: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign Up"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Have an account already?
            </Text>
            <Link
              href="/sign_in"
              className="text-lg font-psemibold text-black-300"
            >
              Sign in
            </Link>
          </View>
          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
                Or want to be a
            </Text>
            <Link
                href="/sign-up-farmer"
                className="text-lg font-psemibold text-black-300"
              >
                Farmer?
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpB;