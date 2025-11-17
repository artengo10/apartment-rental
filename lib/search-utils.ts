import { SearchCriteria } from "@/types/scoring";

export const getSearchCriteria = (): SearchCriteria | null => {
  if (typeof window === "undefined") return null;

  try {
    const criteria = sessionStorage.getItem("searchCriteria");
    return criteria ? JSON.parse(criteria) : null;
  } catch {
    return null;
  }
};
