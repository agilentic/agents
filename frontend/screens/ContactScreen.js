import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import AnimatedCTAButton from '../components/AnimatedCTAButton';
import axios from 'axios';

export default function ContactScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = async () => {
    await axios.post('/contact-form', { email, message });
    setSubmitted(true);
  };

  return (
    <View className="bg-[#f6f2eb] flex-1 p-4">
      {submitted ? (
        <Text className="text-xl">Thanks for contacting us!</Text>
      ) : (
        <>
          <TextInput
            className="border p-2 mb-2"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="border p-2 mb-2"
            placeholder="Message"
            value={message}
            onChangeText={setMessage}
          />
          <AnimatedCTAButton text="Submit" onPress={submit} />
        </>
      )}
    </View>
  );
}
