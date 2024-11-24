import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function ProductsPage() {
  // Mock data
  const products = [
    { id: 1, name: 'Tomatoes', category: 'Vegetables', price: '$2' },
    { id: 2, name: 'Apples', category: 'Fruits', price: '$3' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Products</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.product}>
            <Text>{item.name}</Text>
            <Text>{item.category}</Text>
            <Text>{item.price}</Text>
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
