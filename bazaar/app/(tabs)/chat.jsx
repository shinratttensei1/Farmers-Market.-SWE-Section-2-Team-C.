import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../(auth)/api";

const Chat = () => {
  const [farmerID, setFarmerID] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatID, setChatID] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user details from AsyncStorage
  const [userID, setUserID] = useState(null);
  const [userRole, setUserRole] = useState(null);

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      const storedUserID = await AsyncStorage.getItem("userID");
      const storedUserRole = await AsyncStorage.getItem("userRole");
      setUserID(storedUserID);
      setUserRole(storedUserRole);
    };
    fetchUserDetails();
  }, []);

  const startChat = async () => {
    if (!farmerID.trim()) {
      Alert.alert("Error", "Please enter a valid Farmer ID.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/chat/create", {
        buyerID: userRole === "buyer" ? userID : farmerID,
        farmerID: userRole === "farmer" ? userID : farmerID,
      });

      setChatID(response.data.chatID);
      fetchMessages(response.data.chatID);
    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Error", "Failed to initiate chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatID) => {
    try {
      setLoading(true);
      const response = await api.get(`/chat/messages/${chatID}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await api.post("/chat/message", {
        chatID,
        sender: userRole,
        messageText: newMessage,
      });

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: userRole,
          messageText: newMessage,
          messageDateTime: new Date().toISOString(),
        },
      ]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message.");
    }
  };

  const renderMessage = ({ item }) => {
    const isSender = item.sender === userRole;

    return (
      <View
        style={[
          styles.messageContainer,
          isSender ? styles.sender : styles.receiver,
        ]}
      >
        <Text style={styles.messageText}>{item.messageText}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.messageDateTime).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!chatID ? (
        <View>
          <Text style={styles.title}>Start a Chat</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Farmer ID"
            value={farmerID}
            onChangeText={setFarmerID}
          />
          <TouchableOpacity style={styles.button} onPress={startChat}>
            <Text style={styles.buttonText}>Start Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            style={styles.messageList}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  messageList: {
    flex: 1,
    marginBottom: 10,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
    maxWidth: "80%",
  },
  sender: {
    alignSelf: "flex-end",
    backgroundColor: "#d1fcd3",
  },
  receiver: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: "#555",
    marginTop: 5,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  sendButton: {
    backgroundColor: "#007bff",
    borderRadius: 8,
    padding: 10,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Chat;
