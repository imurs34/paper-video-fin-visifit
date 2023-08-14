import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  zoomOpen: false,
};

export const zoomSlice = createSlice({
  name: 'zoom',
  initialState,
  reducers: {
    toggleZoom: (state) => {
      state.zoomOpen = !state.zoomOpen;
    }
  },
});

export const { toggleZoom } = zoomSlice.actions;

export default zoomSlice.reducer;