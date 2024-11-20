import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";

import { images } from "../../constants";
import { CustomButton, FormField } from "../../components";
// import { getCurrentUser, signIn } from "../../lib/appwrite";
// import { useGlobalContext } from "../../context/GlobalProvider";

const SignIn = () => {
  // const { setUser, setIsLogged } = useGlobalContext();
  // const [isSubmitting, setSubmitting] = useState(false);
  // const [form, setForm] = useState({
  //   email: "",
  //   password: "",
  // });

  // const submit = async () => {
  //   if (form.email === "" || form.password === "") {
  //     Alert.alert("Error", "Please fill in all fields");
  //   }

  //   setSubmitting(true);

  //   try {
  //     await signIn(form.email, form.password);
  //     const result = await getCurrentUser();
  //     setUser(result);
  //     setIsLogged(true);

  //     Alert.alert("Success", "User signed in successfully");
  //     router.replace("/home");
  //   } catch (error) {
  //     Alert.alert("Error", error.message);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  return (
    <SafeAreaView style={{ backgroundColor: "#97886b", height: "100%" }}>
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
            Log in to bazaar
          </Text>

          <FormField
            className="text-black-300"
            title="Email"
            // value={form.email}
            // handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            // value={form.password}
            // handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Sign In"
            // handlePress={submit}
            containerStyles="mt-7"
            // isLoading={isSubmitting}
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
              className="text-secondary"
              style={{
                fontSize: 16,
                fontFamily: "Poppins-Regular",
              }}
            >
              Don't have an account?
            </Text>
            <Link
              href="/sign-up"
              className='text-black-300'
              style={{
                fontSize: 16,
                fontWeight: "600",
                fontFamily: "Poppins-SemiBold",
              }}
            >
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;