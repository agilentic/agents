import React from 'react';
import { View, Text } from 'react-native';

export default function TestimonialCard({ quote, author }) {
  return (
    <View className="p-4">
      <View className="bg-white rounded p-4 shadow">
        <Text className="italic mb-2">"{quote}"</Text>
        <Text className="font-bold">- {author}</Text>
      </View>
    </View>
  );
}
