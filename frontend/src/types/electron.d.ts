export { };

declare global {
  interface Window {
    electron: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      selectFolder: () => Promise<string | null>
    };
  }
}