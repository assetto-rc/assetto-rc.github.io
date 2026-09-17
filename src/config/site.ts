export interface NavItem {
  label: string;
  href: string;
}

export const siteConfig = {
  title: 'arc',
  description: "noah's arc.",
  githubUrl: 'https://github.com/assetto-rc',
  nav: [
    { label: 'tracks', href: '/tracks' },
  ] as NavItem[],
};
