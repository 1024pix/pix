import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  createCertificationPointOfContactWithCustomCenters,
  createCertificationCenter,
  authenticateSession,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session List', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certificationPointOfContact;

  module('When certificationPointOfContact is not authenticated', function() {

    test('it should not be accessible', async function(assert) {
      // when
      await visit('/sessions/liste');

      // then
      assert.equal(currentURL(), '/connexion');
    });

  });

  module('When certificationPointOfContact is authenticated', function(hooks) {
    let certificationCenterId;

    hooks.beforeEach(async function() {
      certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      certificationCenterId = certificationPointOfContact.currentCertificationCenterId;

      await authenticateSession(certificationPointOfContact.id);
    });

    test('it should be accessible', async function(assert) {
      // when
      await visit('/sessions/liste');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

    test('it should show title indicating that the certificationPointOfContact can create a session', async function(assert) {
      // when
      await visit('/sessions/liste');

      // then
      assert.dom('.page-title').hasText('Créez votre première session de certification');
    });

    module('when some sessions exist', function() {

      test('it should list the sessions', async function(assert) {
        // given
        server.createList('session-summary', 5, { certificationCenterId, date: '2019-01-01' });

        // when
        await visit('/sessions/liste');

        // then
        assert.dom('table tbody tr').exists({ count: 5 });
      });

      test('it should redirect to detail page of clicked session-summary', async function(assert) {
        // given
        server.create('session-summary', { id: 123, address: 'Adresse', certificationCenterId, date: '2020-01-01', time: '14:00' });
        server.create('session', { id: 123, address: 'Adresse', certificationCenterId, date: '2020-01-01', time: '14:00' });
        await visit('/sessions/liste');

        // when
        await click('[aria-label="Session de certification"]');

        // then
        assert.equal(currentURL(), '/sessions/123');
      });

      test('it should update message display when selected certif center changes', async function(assert) {
        // given
        const centerManagingStudents = createCertificationCenter({ certificationCenterName: 'Centre SCO isM', certificationCenterType: 'SCO', isRelatedOrganizationManagingStudents: true });
        const centerNotManagingStudents = createCertificationCenter({ certificationCenterName: 'Centre SCO isNotM', certificationCenterType: 'SCO', isRelatedOrganizationManagingStudents: false });
        certificationPointOfContact = createCertificationPointOfContactWithCustomCenters({
          pixCertifTermsOfServiceAccepted: true,
          certificationCenters: [centerNotManagingStudents, centerManagingStudents],
        });
        certificationCenterId = certificationPointOfContact.certificationCenterId;
        await authenticateSession(certificationPointOfContact.id);
        server.create('session-summary', { certificationCenterId: centerManagingStudents.id });

        // when
        await visit('/sessions/liste');
        await click('.logged-user-summary__link');
        await click('.logged-user-menu-item');

        // then
        assert.dom('.pix-message').doesNotExist();
      });
    });
  });
});
