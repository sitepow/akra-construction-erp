import { configureStore } from '@reduxjs/toolkit';
import rootState from './slice/rootState';

const store = configureStore({
  reducer: { rootState },
});

export default store;
  