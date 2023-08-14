import { configureStore } from '@reduxjs/toolkit'
import toggleReducer from './reducers/toggleReducer'
import zoomSlice from './reducers/zoomReducer'

export const store = configureStore({
  reducer: {
    toggle: toggleReducer,
    zoom: zoomSlice,
  },
})