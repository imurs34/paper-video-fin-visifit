import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  map1: false,
  map2: false,
};

export const toggleSlice = createSlice({
  name: 'toggle',
  initialState,
  reducers: {
    toggleMap1: (state) => {
      state.map1 = !state.map1;
    },
    toggleMap2: (state) => {
      state.map2 = !state.map2;
    },
  },
});

export const { toggleMap1, toggleMap2 } = toggleSlice.actions;

export default toggleSlice.reducer;