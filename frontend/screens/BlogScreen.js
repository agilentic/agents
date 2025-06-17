import React from 'react';
import { ScrollView } from 'react-native';
import { Text } from 'react-native';
import data from '../data/sampleData';

export default function BlogScreen() {
  return (
    <ScrollView className="bg-[#f6f2eb] p-4">
      {data.posts.map(post => (
        <Text key={post.id} className="text-lg mb-4">
          {post.title}
        </Text>
      ))}
    </ScrollView>
  );
}
