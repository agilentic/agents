import React, { createContext, useEffect, useState } from 'react';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import { firebaseConfig } from '../firebaseConfig';

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(u => setUser(u));
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}
