export type Cases = {
  valid: { name: string; code: string; fileName?: string }[];
  invalid: {
    name: string;
    code: string;
    fileName?: string;
    errorId?: string | string[];
    fixOutput?: string;
    suggestionOutput?: string;
  }[];
};
