export type Cases = {
  valid: { name: string; code: string }[];
  invalid: {
    name: string;
    code: string;
    errorId?: string;
    fixOutput?: string;
  }[];
};
