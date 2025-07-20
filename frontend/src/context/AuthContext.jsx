import React, { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// 1. Create the context
const AuthContext = createContext();

// 2. Define the initial state and the reducer function
const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user, // We'll add user data later
        token: action.payload.token,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    default:
      return state;
  }
};

// 3. Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // This effect will run when the app starts to check for a token
    // and potentially load user data. For now, it just sets the auth header.
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      // Here you would typically also fetch the user's data
      // For now, we'll assume login is successful if a token exists
      // In a real app, you'd verify the token with the backend
      if (!state.isAuthenticated) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { token: state.token, user: null } });
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token, state.isAuthenticated]);

  return (
    <AuthContext.Provider value={{ ...state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
