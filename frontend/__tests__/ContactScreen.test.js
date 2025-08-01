import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ContactScreen from '../screens/ContactScreen';

jest.mock('axios', () => ({ post: jest.fn(() => Promise.resolve()) }));

test('submits contact form', async () => {
  const { getByPlaceholderText, getByText } = render(<ContactScreen />);
  fireEvent.changeText(getByPlaceholderText('Email'), 'a@b.com');
  fireEvent.changeText(getByPlaceholderText('Message'), 'hi');
  fireEvent.press(getByText('Submit'));
});
