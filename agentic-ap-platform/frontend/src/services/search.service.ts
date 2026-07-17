import api from "./api";
import type { GlobalSearchResult } from "@/types";

export const searchApi = {
  global: async (q: string) => {
    const { data } = await api.get<GlobalSearchResult>("/search", { params: { q } });
    return data;
  },
};
