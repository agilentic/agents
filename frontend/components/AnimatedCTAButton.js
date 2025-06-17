import React from 'react';
import { Pressable, Text } from 'react-native';

export default function AnimatedCTAButton({ text, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-[#1e90ff] px-4 py-2 rounded transition ease-in-out duration-300 active:scale-95"
    >
      <Text className="text-white text-lg">{text}</Text>
    </Pressable>
  );
}
