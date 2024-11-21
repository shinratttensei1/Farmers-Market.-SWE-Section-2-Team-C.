import { useState, useEffect } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
import api from './api';

const SignIn = () => {
  // const { setUser, setIsLogged } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    login: "",
    password: "",
  });

  const submit = async () => {
    if (form.login === "" || form.password === "") {
      alert("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    try {
      // console.log(api); 
      // console.log(api.post);
      // const response = await axios.post('http://localhost:5000/register/farmer', formattedForm);
      const response = await api.post('auth/login', setForm);
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
            Log in to <u>bazaar</u>
          </Text>

          <FormField
            className="text-black-300"
            title="Login"
            value={form.login}
            handleChangeText={(e) => setForm({ ...form, login: e })}
            otherStyles="mt-7"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />

          <View
            style={{
              justifyContent: "center",
              paddingTop: 20,
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Text
              className="text-gray-100"
              style={{
                fontSize: 16,
                fontFamily: "Poppins-Regular",
              }}
            >
              Don't have an account?  Sign Up as a
            </Text>
            <Link
              href="/sign-up-farmer"
              className='text-black-300'
              style={{
                fontSize: 18,
                fontWeight: "600",
                fontFamily: "Poppins-SemiBold",
              }}
            >
            <u>Farmer</u>
            </Link>
            <Text
              className="text-gray-100"
              style={{
                fontSize: 16,
                fontFamily: "Poppins-Regular",
              }}
            >
              or as a
            </Text>
            <Link
              href="/sign-up-buyer"
              className='text-black-300'
              style={{
                fontSize: 18,
                fontWeight: "600",
                fontFamily: "Poppins-SemiBold",
              }}
            >
              <u>Buyer</u>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;