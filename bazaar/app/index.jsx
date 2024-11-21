import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import { CustomButton, Loader } from "../components";
import "./global.css"
// import { useGlobalContext } from "../context/GlobalProvider";

export default function App() {
  return (
    <SafeAreaView style={{ backgroundColor: "#97886b", height: "100%" }}>
      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
      >
        <View
          style={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            paddingHorizontal: 16,
          }}
        >
          <Image
            source={images.bazaar_logo}
            style={{
              resizeMode: "contain",
              width: 350,
              height: 150,
            }}
          />

          {/* <Image
            source={images.freakbob}
            style={{
              resizeMode: "contain",
              width: "100%",
              height: 298,
              maxWidth: 380,
            }}
          /> */}

          <View style={{ position: "relative", marginTop: 20 }}>
            <Text
              style={{
                fontSize: 24,
                color: "white",
                opacity: "90%",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Dive into the world of{"\n"}
              the best agrar stuff with{" "}
              <Text style={{
                color: "#3f3a36",
                fontFamily: "Afacad-Regular",
                fontStyle: "italic",
                fontSize: 30 }}><u>Bazaar</u></Text>
            </Text>

            {/* <Image
              source={images.path}
              style={{
                resizeMode: "contain",
                width: 136,
                height: 15,
                position: "absolute",
                bottom: -8,
                right: -32,
              }}
            /> */}
          </View>

          <Text
            style={{
              fontSize: 14,
              fontWeight: "400",
              color: "#dfe0df",
              marginTop: 28,
              textAlign: "center",
            }}
          >
            
          </Text>

          <CustomButton
            title="Let's Go!"
            handlePress={() => router.push("../sign_in")}
            containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}