import { invalidateSession as invalidateSessionOrigin } from 'ember-simple-auth/test-support';

async function invalidateSession() {
  sessionStorage.clear();
  await invalidateSessionOrigin();
}

export default invalidateSession;
export { invalidateSession };
