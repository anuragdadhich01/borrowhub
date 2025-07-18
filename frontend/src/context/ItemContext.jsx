import React, { createContext, useReducer } from 'react';

const ItemContext = createContext();

const itemReducer = (state, action) => {
  switch (action.type) {
    case 'GET_ITEMS':
      return {
        ...state,
        items:  [action.payload, ...state.items],
        loading: false,
      };
    default:
      return state;
  }
};

export const ItemProvider = ({ children }) => {
  const initialState = {
    items: [],
    loading: true,
  };

  const [state, dispatch] = useReducer(itemReducer, initialState);

  return (
    <ItemContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ItemContext.Provider>
  );
};

export default ItemContext;