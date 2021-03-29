import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | user', function(hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function() {
    store = this.owner.lookup('service:store');
  });

  module('#fullName', function() {

    test('it should return the fullname, combination of last and first name', function(assert) {
      // given
      const user = run(() => {
        return store.createRecord('user', { firstName: 'Jean-Baptiste', lastName: 'Poquelin' });
      });

      // when
      const fullName = user.fullName;

      // then
      assert.equal(fullName, 'Jean-Baptiste Poquelin');
    });
  });

  module('#hasEmailAuthenticationMethod', function() {

    test('it should return true when email is defined and user has PIX authentication method', function(assert) {
      // given
      const authenticationMethod = store.createRecord('authentication-method', { identityProvider: 'PIX' });
      const user = store.createRecord('user', { email: 'john.doe@example.net', authenticationMethods: [authenticationMethod] });

      // then
      assert.equal(user.hasEmailAuthenticationMethod, true);
    });
  });

  module('#hasUsernameAuthenticationMethod', function() {

    test('it should return true when username is defined and user has PIX authentication method', function(assert) {
      // given
      const authenticationMethod = store.createRecord('authentication-method', { identityProvider: 'PIX' });
      const user = store.createRecord('user', {
        username: 'john.doe0101',
        authenticationMethods: [authenticationMethod],
      });

      // then
      assert.equal(user.hasUsernameAuthenticationMethod, true);
    });
  });

  module('#hasPoleEmploiAuthenticationMethod', function() {

    test('it should return true when user has Pole Emploi authentication method', function(assert) {
      // given
      const authenticationMethod = store.createRecord('authentication-method', { identityProvider: 'POLE_EMPLOI' });
      const user = store.createRecord('user', { authenticationMethods: [authenticationMethod] });

      // then
      assert.equal(user.hasPoleEmploiAuthenticationMethod, true);
    });
  });

  module('#hasGARAuthenticationMethod', function() {

    test('it should return true when user has GAR authentication method', function(assert) {
      // given
      const authenticationMethod = store.createRecord('authentication-method', { identityProvider: 'GAR' });
      const user = store.createRecord('user', { authenticationMethods: [authenticationMethod] });

      // then
      assert.equal(user.hasGARAuthenticationMethod, true);
    });
  });
});
