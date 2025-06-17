import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import HeroSection from '../components/HeroSection';
import FeatureGrid from '../components/FeatureGrid';
import TestimonialCard from '../components/TestimonialCard';
import AnimatedCTAButton from '../components/AnimatedCTAButton';
import data from '../data/sampleData';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView className="bg-[#f6f2eb]">
      <HeroSection
        heading="Build Something Great"
        subheading="Greg Isenberg inspired design"
        ctaText="Get Started"
        onPress={() => navigation.navigate('Features')}
      />
      <FeatureGrid features={data.features} />
      {data.testimonials.map(t => (
        <TestimonialCard key={t.author} {...t} />
      ))}
      <View className="p-4 flex items-center">
        <AnimatedCTAButton
          text="Join Dashboard"
          onPress={() => navigation.navigate('Dashboard')}
        />
      </View>
    </ScrollView>
  );
}
