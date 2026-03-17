export const appPaths = {
  home: '/',
  tutorial: '/tutorial',
  levels: '/levels',
  profile: '/profile',
  case: (caseId: string) => `/case/${caseId}`,
  result: (caseId: string) => `/result/${caseId}`,
} as const;
