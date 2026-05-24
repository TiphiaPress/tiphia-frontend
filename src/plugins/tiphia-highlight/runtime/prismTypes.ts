declare global {
  interface Window {
    Prism?: {
      highlight?: (text: string, grammar: unknown, language: string) => string;
      highlightElement?: (element: Element) => void;
      highlightAllUnder?: (container: ParentNode) => void;
      manual?: boolean;
      languages?: Record<string, unknown>;
    };
  }
}

export {};
