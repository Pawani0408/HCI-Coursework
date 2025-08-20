import { create } from 'zustand';

export const useFurnitureStore = create((set, get) => ({
  furniture: [],
  isLoading: false,
  error: null,
  
  setFurniture: (furniture) => set({ furniture }),
  
  addFurniture: (item) => set((state) => ({
    furniture: [...state.furniture, item]
  })),
  
  updateFurniture: (id, updates) => set((state) => ({
    furniture: state.furniture.map(item => 
      item._id === id ? { ...item, ...updates } : item
    )
  })),
  
  removeFurniture: (id) => set((state) => ({
    furniture: state.furniture.filter(item => item._id !== id)
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  getFurnitureById: (id) => {
    const { furniture } = get();
    return furniture.find(item => item._id === id);
  },
}));
