import React from 'react';
import { View, Text, Pressable } from 'react-native';

export default function Hero() {
  return (
    <View className="items-center py-24">
      <Text className="text-4xl font-bold mb-4">Agents</Text>
      <Text className="text-lg mb-6">Build modern apps with ease</Text>
      <Pressable className="bg-black dark:bg-white px-4 py-2 rounded">
        <Text className="text-white dark:text-black">Get Started</Text>
      </Pressable>
    </View>
  );
}
