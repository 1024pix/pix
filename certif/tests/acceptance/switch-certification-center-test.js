import { module, test } from 'qunit';
import { click, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Switch Certification Center', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When connected certificationPointOfContact is linked to only one certification center', function(hooks) {

    hooks.beforeEach(async function() {
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      await authenticateSession(certificationPointOfContact.id);
    });

    test('should display the main certification center name and externalId in summary', async function(assert) {
      // when
      await visit('/');

      // then
      assert.dom('.logged-user-summary__certification-center').hasText('Centre de certification du pix (ABC123)');
    });

    test('should have no organization in menu', async function(assert) {
      // given
      await visit('/');

      // when
      await click('.logged-user-summary__link');

      // then
      assert.dom('.logged-user-menu-item__certification-center-name').doesNotExist();
    });
  });

  module('When connected certificationPointOfContact is linked to more than one certification center', function(hooks) {

    let currentCertificationCenter;
    let otherCertificationCenter;
    let otherCertificationCenterSession;

    hooks.beforeEach(async function() {
      currentCertificationCenter = server.create('certification-center', { name: 'currentCertificationCenterName', externalId: 'currentCertificationCenterExternalId' });
      currentCertificationCenter.save();

      otherCertificationCenter = server.create('certification-center', { name: 'otherCertificationCenterName', externalId: 'otherCertificationCenterExternalId' });
      otherCertificationCenterSession = server.create('session', { certificationCenterId: otherCertificationCenter.id, address: `Session ${otherCertificationCenter.id}` });
      otherCertificationCenter.save();
      otherCertificationCenterSession.save();

      const certificationPointOfContact = server.create('certification-point-of-contact', {
        currentCertificationCenterId: parseInt(currentCertificationCenter.id),
        certificationCenters: [currentCertificationCenter, otherCertificationCenter],
        pixCertifTermsOfServiceAccepted: true,
      });
      certificationPointOfContact.save();

      await authenticateSession(certificationPointOfContact.id);

      await visit('/');
    });

    test('should have an certification center in menu', async function(assert) {
      // when
      await click('.logged-user-summary__link');

      // then
      assert.dom('.logged-user-menu-item__certification-center-name').exists();
      assert.dom('.logged-user-menu-item__certification-center-name').hasText(otherCertificationCenter.name);
      assert.dom('.logged-user-menu-item__certification-center-externalId').hasText(`(${otherCertificationCenter.externalId})`);
    });

    module('When certficationPointOfContact click on a certification center', function() {

      test('should change main certification center in summary', async function(assert) {
        // when
        await click('.logged-user-summary__link');
        await click('.logged-user-menu-item');

        // then
        assert.dom('.logged-user-summary__certification-center').hasText(`${otherCertificationCenter.name} (${otherCertificationCenter.externalId})`);
      });

      test('should have the old main certification center in the menu', async function(assert) {
        // when
        await click('.logged-user-summary__link');
        await click('.logged-user-menu-item');
        await click('.logged-user-summary__link');

        // then
        assert.dom('.logged-user-menu-item__certification-center-name').exists();
        assert.dom('.logged-user-menu-item__certification-center-name').hasText(currentCertificationCenter.name);
        assert.dom('.logged-user-menu-item__certification-center-externalId').hasText(`(${currentCertificationCenter.externalId})`);
      });

      test('should display the main certification center sessions', async function(assert) {
        // when
        await click('.logged-user-summary__link');
        await click('.logged-user-menu-item');

        // then
        assert.dom(`tr[data-test-id="session-list-row__${otherCertificationCenterSession.id}"] > td:nth-child(2)`).hasText(otherCertificationCenterSession.address);
      });
    });
  });
});
