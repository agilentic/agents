import React from 'react';
import { View, Text } from 'react-native';

export default function FeatureGrid({ features }) {
  return (
    <View className="p-4 flex flex-row flex-wrap justify-center">
      {features.map(f => (
        <View key={f.title} className="w-1/2 p-2">
          <View className="bg-white p-4 rounded shadow">
            <Text className="text-xl font-bold mb-1">{f.title}</Text>
            <Text>{f.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
