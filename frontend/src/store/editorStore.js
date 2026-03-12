import { create } from 'zustand'

const useEditorStore = create((set) => ({
  blocks: [],

  addBlock: (block) =>
    set((s) => ({ blocks: [...s.blocks, block] })),

  removeBlock: (id) =>
    set((s) => ({ blocks: s.blocks.filter(b => b.id !== id) })),

  updateBlock: (id, content) =>
    set((s) => ({
      blocks: s.blocks.map(b => b.id === id ? { ...b, content } : b)
    })),

  reorderBlocks: (blocks) => set({ blocks }),
}))

export default useEditorStore
