import React from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';

export default function DashboardPage() {
  // Mock farmer product data
  const farmerProducts = [
    { id: 1, name: 'Tomatoes', quantity: 10, price: '$2' },
    { id: 2, name: 'Apples', quantity: 5, price: '$3' },
  ];

  const handleUpdate = (id) => {
    console.log(`Update product with ID: ${id}`);
  };

  const handleDelete = (id) => {
    console.log(`Delete product with ID: ${id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Products</Text>
      <FlatList
        data={farmerProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.product}>
            <Text>{item.name} - {item.quantity} units - {item.price}</Text>
            <Button title="Update" onPress={() => handleUpdate(item.id)} />
            <Button title="Delete" onPress={() => handleDelete(item.id)} color="red" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  product: { marginBottom: 10, padding: 10, borderWidth: 1, borderRadius: 5 },
});
