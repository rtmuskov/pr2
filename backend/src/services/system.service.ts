export function getSystemInfoPayload() {
  return {
    service: 'qa-inspector-backend',
    status: 'ready',
    modules: ['auth', 'profile', 'progress'],
  };
}
