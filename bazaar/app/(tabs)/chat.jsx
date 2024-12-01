import React, { useState, useEffect } from "react";
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
  const [farmerID, setFarmerID] = useState(""); // Farmer ID for starting new chats
  const [activeChats, setActiveChats] = useState([]); // List of active chats
  const [messages, setMessages] = useState([]); // Messages in the current chat
  const [newMessage, setNewMessage] = useState(""); // New message input
  const [chatID, setChatID] = useState(null); // Currently selected chat ID
  const [loading, setLoading] = useState(false); // Loading state for API calls

  const [userID, setUserID] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const storedUserID = await AsyncStorage.getItem("userID");
      const storedUserRole = await AsyncStorage.getItem("userRole");
      setUserID(storedUserID);
      setUserRole(storedUserRole);

      if (storedUserID) {
        fetchActiveChats(storedUserID);
      }
    };
    fetchUserDetails();
  }, []);

  const fetchActiveChats = async (userID) => {
    try {
      setLoading(true);
      const response = await api.get(`/chat/active/${userID}`);
      setActiveChats(response.data.chats || []);
    } catch (error) {
      console.error("Error fetching active chats:", error);
      Alert.alert("Error", "Failed to load active chats.");
    } finally {
      setLoading(false);
    }
  };

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
      setChatID(chatID);
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
      setNewMessage(""); // Clear the input field after sending
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message.");
    }
  };

  const renderChatItem = ({ item }) => {
    const otherUserID = item.otherUserID; // The ID of the other participant
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => fetchMessages(item.chatID)}
      >
        <Text style={styles.chatText}>Chat with User ID: {otherUserID}</Text>
        <Text style={styles.chatTimestamp}>
          Last Updated: {new Date(item.lastUpdated * 1000).toLocaleString()}
        </Text>
      </TouchableOpacity>
    );
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
          <Text style={styles.title}>Active Chats</Text>
          <FlatList
            data={activeChats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.chatID.toString()}
            contentContainerStyle={styles.chatList}
            ListEmptyComponent={
              <Text style={styles.noChatsText}>No active chats found.</Text>
            }
          />
          <View style={styles.newChatContainer}>
            <Text style={styles.newChatTitle}>Start a New Chat</Text>
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
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  chatList: {
    flexGrow: 1,
    marginVertical: 10,
  },
  chatItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  chatTimestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  noChatsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 20,
  },
  newChatContainer: {
    marginVertical: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newChatTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    flex: 1,
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
    flexGrow: 1,
    paddingBottom: 10,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 15,
    maxWidth: "75%",
  },
  sender: {
    alignSelf: "flex-end",
    backgroundColor: "#daf5d9",
  },
  receiver: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f0f0",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  messageTime: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Chat;
