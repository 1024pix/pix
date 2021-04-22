import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authenticated', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user clicks the sidebar logo', function() {
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

  module('When user clicks the sessions sidebar menu entry', function() {
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

  module('Sco temporary banner', function() {
    test('it should display the banner when User is SCO isManagingStudent', async function(assert) {
      // given
      const certificationPointOfContact = createScoIsManagingStudentsCertificationPointOfContactWithTermsOfServiceAccepted();
      await authenticateSession(certificationPointOfContact.id);

      // when
      await visit('/sessions/liste');

      // then
      assert.dom('.sco-temporary-banner').hasText('La certification en collège et lycée est possible jusqu\'au 25 juin. Pour reporter des sessions déjà programmées, il vous suffit de changer la date de la session en cliquant sur « modifier ». En savoir plus');
    });

    test('it should not display the banner when User is NOT SCO isManagingStudent', async function(assert) {
      // given
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      await authenticateSession(certificationPointOfContact.id);

      // when
      await visit('/sessions/liste');

      // then
      assert.dom('.sco-temporary-banner').doesNotExist();
    });
  });

});
