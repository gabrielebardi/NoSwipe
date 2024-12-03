declare module '@testing-library/react' {
  export const screen: {
    getByText: (text: string | RegExp) => HTMLElement;
    getByRole: (role: string, options?: { name: string | RegExp }) => HTMLElement;
    getByPlaceholderText: (text: string) => HTMLElement;
  };

  export const fireEvent: {
    click: (element: HTMLElement) => void;
    change: (element: HTMLElement, options: { target: { value: string } }) => void;
  };

  export const waitFor: (callback: () => void | Promise<void>) => Promise<void>;
  
  export function render(
    ui: React.ReactElement,
    options?: {
      container?: HTMLElement;
      baseElement?: HTMLElement;
      hydrate?: boolean;
    }
  ): {
    container: HTMLElement;
    baseElement: HTMLElement;
    debug: (baseElement?: HTMLElement | DocumentFragment) => void;
    rerender: (ui: React.ReactElement) => void;
    unmount: () => void;
  };
} 