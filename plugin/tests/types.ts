export type Cases<MessageId extends string = string> = {
  valid: { name: string; code: string; fileName?: string }[];
  invalid: {
    name: string;
    code: string;
    fileName?: string;
    errorId?: MessageId | MessageId[];
    fixOutput?: string;
    suggestionOutput?: string;
  }[];
};
