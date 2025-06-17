import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import AnimatedCTAButton from '../components/AnimatedCTAButton';

it('triggers onPress', () => {
  const fn = jest.fn();
  const { getByText } = render(<AnimatedCTAButton text="Click" onPress={fn} />);
  fireEvent.press(getByText('Click'));
  expect(fn).toHaveBeenCalled();
});
