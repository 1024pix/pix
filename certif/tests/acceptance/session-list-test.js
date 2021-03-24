import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createCertificationPointOfContactWithTermsOfServiceAccepted, authenticateSession } from '../helpers/test-init';
import { statusToDisplayName } from 'pix-certif/models/session';
import moment from 'moment';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session List', (hooks) => {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certificationPointOfContact;

  module('When certificationPointOfContact is not authenticated', () => {

    test('it should not be accessible', async function(assert) {
      // when
      await visit('/sessions/liste');

      // then
      assert.equal(currentURL(), '/connexion');
    });

  });

  module('When certificationPointOfContact is authenticated', (hooks) => {
    let certificationCenterId;

    hooks.beforeEach(async () => {
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

    module('when some sessions exist', () => {
      const nbExtraSessions = 11;

      test('it should list the sessions and their attributes with status', async function(assert) {
        // given
        const firstSession = server.create('session', { address: 'Adresse', certificationCenterId, date: '2020-01-01', time: '14:00' });
        server.createList('session', nbExtraSessions, { certificationCenterId, date: '2019-01-01' });

        // when
        await visit('/sessions/liste');

        // then
        const formattedDate = moment(firstSession.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
        assert.dom('table tbody tr').exists({ count: nbExtraSessions + 1 });
        assert.dom('table tbody tr:first-child').hasText(`${firstSession.id} ${firstSession.address} ${firstSession.room} ${formattedDate} ${firstSession.time} ${firstSession.examiner} ${statusToDisplayName.created}`);
      });

      test('it should sort the sessions from recent to older', async function(assert) {
        // given
        const lessLessRecentSession = server.create('session', { address: 'Adresse', certificationCenterId, date: '2019-01-01', time: '13:00' });
        const mostRecentSession = server.create('session', { address: 'Adresse', certificationCenterId, date: '2020-01-01', time: '14:00' });
        const lessRecentSession = server.create('session', { address: 'Adresse', certificationCenterId, date: '2019-01-01', time: '14:00' });

        // when
        await visit('/sessions/liste');

        // then
        assert.dom('table tbody tr').exists({ count: 3 });
        assert.dom('table tbody tr:nth-child(1) td').hasText(`${mostRecentSession.id}`);
        assert.dom('table tbody tr:nth-child(2) td').hasText(`${lessRecentSession.id}`);
        assert.dom('table tbody tr:nth-child(3) td').hasText(`${lessLessRecentSession.id}`);
      });

      test('it should redirect to detail page of session id 1 on click on first row', async function(assert) {
        // given
        const firstSession = server.create('session', { address: 'Adresse', certificationCenterId, date: '2020-01-01', time: '14:00' });
        server.createList('session', nbExtraSessions, { certificationCenterId, date: '2019-01-01' });
        await visit('/sessions/liste');

        // when
        await click(`[data-test-id="session-list-row__${firstSession.id}"]`);

        // then
        assert.equal(currentURL(), `/sessions/${firstSession.id}`);
      });
    });
  });
});
