import React, { useContext } from 'react';
import { View, Text } from 'react-native';
import { AuthContext } from './AuthProvider';
import AnimatedCTAButton from './AnimatedCTAButton';

export default function AuthGuard({ children, navigation }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl mb-4">Please log in to continue.</Text>
        <AnimatedCTAButton text="Login" onPress={() => navigation.navigate('Home')} />
      </View>
    );
  }

  return children;
}
