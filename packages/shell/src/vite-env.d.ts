/// <reference types="vite/client" />

declare module 'authMFE/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'catalogMFE/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'staticMFE/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'staticMFE/HomePage' {
  const HomePage: React.ComponentType;
  export { HomePage };
}

declare module 'staticMFE/AboutPage' {
  const AboutPage: React.ComponentType;
  export { AboutPage };
}

declare module 'staticMFE/ContactPage' {
  const ContactPage: React.ComponentType;
  export { ContactPage };
}

declare module 'staticMFE/ManualPage' {
  const ManualPage: React.ComponentType;
  export { ManualPage };
}

declare module 'staticMFE/SitemapPage' {
  const SitemapPage: React.ComponentType;
  export { SitemapPage };
}
declare module 'commentsMFE/App' {
  const CommentsPage: React.ComponentType;
  export { CommentsPage };
}

declare module 'favoritesMFE/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'profileMFE/App' {
  const App: React.ComponentType;
  export default App;
}

declare module 'playerMFE/App' {
  const App: React.ComponentType;
  export default App;
}


interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly VITE_AUTH_MFE_URL?: string;
  readonly VITE_STATIC_MFE_URL?: string;
  readonly VITE_COMMENT_MFE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
