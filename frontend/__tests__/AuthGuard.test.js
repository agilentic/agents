import React from 'react';
import { render } from '@testing-library/react-native';
import AuthGuard from '../components/AuthGuard';
import { AuthContext } from '../components/AuthProvider';

it('renders children when user logged in', () => {
  const tree = render(
    <AuthContext.Provider value={{ user: {} }}>
      <AuthGuard navigation={{ navigate: jest.fn() }}>
        <></>
      </AuthGuard>
    </AuthContext.Provider>
  );
  expect(tree.toJSON()).toBeTruthy();
});
