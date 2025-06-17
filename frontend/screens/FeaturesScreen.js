import React from 'react';
import { ScrollView } from 'react-native';
import FeatureGrid from '../components/FeatureGrid';
import data from '../data/sampleData';

export default function FeaturesScreen() {
  return (
    <ScrollView className="bg-[#f6f2eb]">
      <FeatureGrid features={data.features} />
    </ScrollView>
  );
}
