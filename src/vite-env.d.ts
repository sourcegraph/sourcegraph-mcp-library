/// <reference types="vite/client" />

declare module "*.claude.log?raw" {
  const content: string;
  export default content;
}
