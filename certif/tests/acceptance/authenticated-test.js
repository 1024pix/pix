import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authenticated', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user clicks the sidebar logo', () => {
    test('it should redirect to the sessions list page', async function(assert) {
      // given
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      const session = server.create('session', { certificationCenterId: certificationPointOfContact.certificationCenterId });
      await authenticateSession(certificationPointOfContact.id);

      // when
      await visit(`/sessions/${session.id}`);
      await click('.sidebar__logo a');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });
  });

  module('When user clicks the sessions sidebar menu entry', () => {
    test('it should also redirect to the sessions list page', async function(assert) {
      // given
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      const session = server.create('session', { certificationCenterId: certificationPointOfContact.certificationCenterId });
      await authenticateSession(certificationPointOfContact.id);

      // when
      await visit(`/sessions/${session.id}`);
      await click('.sidebar-menu ul li a:first-child');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });
  });

});
