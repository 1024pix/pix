import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { setupApplicationTest } from 'ember-qunit';
import {
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authenticated | team', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should be possible to see members list', async function(assert) {
    // given
    const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
    server.create('member', { firstName: 'Lili', lastName: 'Dupont' });
    await authenticateSession(certificationPointOfContact.id);

    // when
    await visit('/equipe');
    await clickByLabel('Équipe');

    // then
    assert.equal(currentURL(), '/equipe');
    assert.contains('Lili');
    assert.contains('Dupont');
  });
});
