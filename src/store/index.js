'use client';

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

// Create store
const store = configureStore({
	reducer: {
		auth: authReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export default store;
