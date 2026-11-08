import { menu } from '@/utils/menu';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidebarCollapsed: false,
  menuLists: menu(),
};

const rootState = createSlice({
  name: 'rootState',
  initialState,
  reducers: {
    setRootState: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
  },
});

export const { setRootState } = rootState.actions;
export default rootState.reducer;
