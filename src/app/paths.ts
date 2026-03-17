export const appPaths = {
  home: '/',
  login: '/login',
  register: '/register',
  tutorial: '/tutorial',
  levels: '/levels',
  profile: '/profile',
  admin: '/admin',
  case: (caseId: string) => `/case/${caseId}`,
  result: (caseId: string) => `/result/${caseId}`,
} as const;
