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
      assert.dom('.pix-banner--information').exists();
      assert.dom('.pix-banner--information').hasText('La certification Pix se déroulera du 29/11/21 au 04/03/22 pour les lycées et du 07/03/22 au 20/05/22 pour les collèges. Les sessions passées hors période ne seront pas traitées. En savoir plus');
    });

    test('it should not display the banner when User is NOT SCO isManagingStudent', async function(assert) {
      // given
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      await authenticateSession(certificationPointOfContact.id);

      // when
      await visit('/sessions/liste');

      // then
      assert.dom('.pix-banner--information').doesNotExist();
    });
  });

});
