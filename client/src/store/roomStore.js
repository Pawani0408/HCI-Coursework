import { create } from 'zustand';

export const useRoomStore = create((set, get) => ({
  currentRoom: {
    name: 'New Room',
    room: {
      width: 10,
      depth: 10,
      height: 3,
      wallColor: '#ffffff',
      floorColor: '#8b7355',
      ceilingColor: '#ffffff',
    },
    furniture: [],
    isPublic: true,
  },
  
  selectedFurniture: null,
  editorMode: '2d', // '2d' or '3d'
  isEditing: false,
  
  setRoom: (room) => set({ currentRoom: room }),
  
  updateRoomSettings: (settings) => set((state) => ({
    currentRoom: {
      ...state.currentRoom,
      room: { ...state.currentRoom.room, ...settings }
    }
  })),
  
  addFurniture: (furnitureItem) => set((state) => ({
    currentRoom: {
      ...state.currentRoom,
      furniture: [...state.currentRoom.furniture, furnitureItem]
    }
  })),
  
  updateFurniture: (index, updates) => set((state) => ({
    currentRoom: {
      ...state.currentRoom,
      furniture: state.currentRoom.furniture.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      )
    }
  })),
  
  removeFurniture: (index) => set((state) => ({
    currentRoom: {
      ...state.currentRoom,
      furniture: state.currentRoom.furniture.filter((_, i) => i !== index)
    }
  })),
  
  setSelectedFurniture: (furniture) => set({ selectedFurniture: furniture }),
  
  setEditorMode: (mode) => set({ editorMode: mode }),
  
  setIsEditing: (editing) => set({ isEditing: editing }),
  
  clearRoom: () => set({
    currentRoom: {
      name: 'New Room',
      room: {
        width: 10,
        depth: 10,
        height: 3,
        wallColor: '#ffffff',
        floorColor: '#8b7355',
        ceilingColor: '#ffffff',
      },
      furniture: [],
      isPublic: true,
    },
    selectedFurniture: null,
    editorMode: '2d',
  }),
}));
