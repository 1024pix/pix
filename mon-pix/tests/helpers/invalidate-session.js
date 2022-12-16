import testSupport from 'ember-simple-auth/test-support';

export async function invalidateSession() {
  sessionStorage.clear();
  await testSupport.invalidateSession();
}
