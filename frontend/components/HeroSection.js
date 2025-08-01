import React from 'react';
import { View, Text } from 'react-native';
import AnimatedCTAButton from './AnimatedCTAButton';

export default function HeroSection({ heading, subheading, ctaText, onPress }) {
  return (
    <View className="p-8 items-center">
      <Text className="text-5xl font-bold mb-2 text-center">{heading}</Text>
      <Text className="text-lg mb-4 text-center">{subheading}</Text>
      <AnimatedCTAButton text={ctaText} onPress={onPress} />
    </View>
  );
}
