import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import Hero from './components/Hero';
import About from './screens/About';

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <View className="p-4">
        <Hero />
        <About />
      </View>
    </SafeAreaView>
  );
}
