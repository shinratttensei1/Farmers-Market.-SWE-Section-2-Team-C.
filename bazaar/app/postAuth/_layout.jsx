import React from "react";
import { Tabs } from "expo-router";
import { FaHome, FaPlusCircle, FaList, FaShoppingCart, FaCartArrowDown } from "react-icons/fa";

export default function PostAuthLayout() {
  return (
    <Tabs
      initialRouteName="mainpage" // Explicitly set the main page as the initial tab
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#ffffff",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Poppins-Regular",
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#6b7280",
      }}
    >
      {/* Main Page */}
      <Tabs.Screen
        name="mainpage" // Path to the main page file (mainpage.jsx)
        options={{
          title: "Main Page",
          tabBarIcon: ({ color }) => <FaHome size={20} color={color} />,
        }}
      />

      {/* Add Product (Farmer only) */}
      <Tabs.Screen
        name="farmer/add_product"
        options={{
          title: "Add Product",
          tabBarIcon: ({ color }) => <FaPlusCircle size={20} color={color} />,
        }}
      />

      {/* Farmer Dashboard */}
      <Tabs.Screen
        name="farmer/dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <FaList size={20} color={color} />,
        }}
      />
      {/* Cart for Buyer */}
            <Tabs.Screen
        name="buyer/cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => <FaShoppingCart size={20} color={color} />,
        }}
      />

    </Tabs>
  );
}
