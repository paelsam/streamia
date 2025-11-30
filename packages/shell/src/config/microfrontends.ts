// Microfrontend configuration
export const MFE_CONFIG = {
  auth: {
    name: 'authMFE',
    url: import.meta.env.DEV ? 'http://localhost:3001' : '/auth',
    routes: ['/login', '/register', '/recover-password', '/reset-password'],
  },
  static: {
    name: 'staticMFE',
    url: import.meta.env.DEV ? 'http://localhost:3006' : '/static',
    routes: ['/', '/about', '/contact', '/manual', '/sitemap'],
  },
  comments: {
    name: 'commentsMFE',
    url: import.meta.env.DEV ? 'http://localhost:3007' : '/comments',
    routes: ['/movies/:id/comments'],
  },
  // Add more microfrontends here as they are created
  // catalog: {
  //   name: 'catalogMFE',
  //   url: import.meta.env.DEV ? 'http://localhost:3003' : '/catalog',
  //   routes: ['/movies', '/movie/:id'],
  // },
};

// Helper function to check if a route belongs to a microfrontend
export const getMFEForRoute = (path: string): { name: string; url: string } | null => {
  for (const [, mfe] of Object.entries(MFE_CONFIG)) {
    const matchesRoute = mfe.routes.some(route => {
      const pattern = route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    });
    
    if (matchesRoute) {
      return { name: mfe.name, url: mfe.url };
    }
  }
  return null;
};

// Helper to get full URL for a microfrontend route
export const getMFEUrl = (path: string): string | null => {
  const mfe = getMFEForRoute(path);
  return mfe ? `${mfe.url}${path}` : null;
};
