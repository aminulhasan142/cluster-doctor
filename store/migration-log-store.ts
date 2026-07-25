import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { MigrationActionLogEntry } from "@/types";

interface MigrationLogStore {
  entries: MigrationActionLogEntry[];
  addEntry: (entry: MigrationActionLogEntry) => void;
  clear: () => void;
}

/**
 * The backend does not persist migration history
 * (`/migration/history` always returns `[]`), so every migration
 * triggered from the UI this session is recorded here instead —
 * every field comes straight from the real `/migration/start`
 * response, nothing is fabricated.
 */
export const useMigrationLogStore = create<MigrationLogStore>()(
  persist(
    (set) => ({
      entries: [],

      addEntry: (entry) =>
        set((state) => ({
          entries: [entry, ...state.entries].slice(0, 100),
        })),

      clear: () => set({ entries: [] }),
    }),
    {
      name: "migration-action-log",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
