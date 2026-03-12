import { create } from 'zustand'

const useEditorStore = create((set) => ({
  blocks: [],
  addBlock: (block) => set((s) => ({ blocks: [...s.blocks, block] })),
  removeBlock: (id) => set((s) => ({ blocks: s.blocks.filter(b => b.id !== id) })),
  reorderBlocks: (blocks) => set({ blocks }),
}))

export default useEditorStore
