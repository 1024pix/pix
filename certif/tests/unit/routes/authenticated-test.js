import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | authenticated', function(hooks) {

  setupTest(hooks);

  test('it should redirect to sessions list if the current user has accepted terms of service', function(assert) {
    // given
    const route =  this.owner.lookup('route:authenticated.index');
    const userWithAcceptedTermsOfService = { pixCertifTermsOfServiceAccepted: true };

    // when
    const redirection = route._selectTransition(userWithAcceptedTermsOfService);

    // then
    assert.equal('authenticated.sessions.list', redirection);
  });
});
