/**
 * Site-wide copy and contact details. PLACEHOLDERS: every value marked TODO is inferred or
 * invented and must be replaced by Kyle before this ships.
 */
export const site = {
  name: 'duckdgoose.net',
  owner: 'Kyle McCullough',
  tagline: '.NET developer. Movie Munch Off. Builds the tooling before the thing.',
  about: [
    // TODO(Kyle): your own words.
    '.NET developer working in C#, EF Core, MySQL and Blazor, mostly on line-of-business systems where the interesting problems live in the data model rather than the screen.',
    'Away from that: Movie Munch Off, and a habit of building the tooling before building the thing. This site is a Windows 95 desktop because a portfolio should be worth clicking around in.',
  ],
  contact: {
    email: 'kylematthewmccullough@gmail.com',
    phone: 'TODO', // TODO(Kyle): or remove the Phone icon.
    location: 'TODO', // TODO(Kyle)
    links: [
      { label: 'GitHub', href: 'https://github.com/kylemccullough1' },
      { label: 'Movie Munch Off', href: 'TODO' }, // TODO(Kyle)
    ],
  },
} as const
