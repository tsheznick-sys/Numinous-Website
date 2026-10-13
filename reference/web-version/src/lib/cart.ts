import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartLine = {
	planId: string;
	title: string;
	priceCents: number;
	quantity: number;
	image?: string;
};

type CartState = {
	lines: CartLine[];
	openTick: number;
	addLine: (line: CartLine) => void;
	removeLine: (planId: string) => void;
	clear: () => void;
};

export const useCartStore = create<CartState>()(
	persist(
		(set) => ({
			lines: [],
			openTick: 0,
			addLine: (line) =>
				set((state) => {
					const next = { ...line, quantity: 1 };
					const existing = state.lines.find(
						(entry) => entry.planId === next.planId,
					);
					if (existing) {
						return { openTick: state.openTick + 1 };
					}
					return {
						openTick: state.openTick + 1,
						lines: [...state.lines, next],
					};
				}),
			removeLine: (planId) =>
				set((state) => ({
					lines: state.lines.filter((entry) => entry.planId !== planId),
				})),
			clear: () => set({ lines: [] }),
		}),
		{
			name: "numinous-cart",
			storage: createJSONStorage(() => localStorage),
			skipHydration: true,
			partialize: (state) => ({ lines: state.lines }),
		},
	),
);
