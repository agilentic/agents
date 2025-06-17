import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView className="bg-[#f6f2eb] p-4">
      <Text className="text-4xl font-bold mb-2">Our Story</Text>
      <Text className="text-lg leading-relaxed">
        We started this project to show how Greg Isenberg-inspired design can be
        implemented with React Native and Firebase.
      </Text>
    </ScrollView>
  );
}
