import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';
import { statusToDisplayName } from 'pix-certif/models/session';
import moment from 'moment';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session List', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When user is not authenticated', function() {

    test('it should not be accessible', async function(assert) {
      // when
      await visit('/sessions/liste');

      // then
      assert.equal(currentURL(), '/connexion');
    });

  });

  module('When user is authenticated', function(hooks) {
    let certificationCenterId;

    hooks.beforeEach(async function() {
      user = createUserWithMembership();
      certificationCenterId = user.certificationCenterMemberships.models[0].certificationCenterId;

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
      const controller = this.owner.lookup('controller:authenticated.sessions.list');
      controller.set('isSessionFinalizationActive', false);
    });

    test('it should be accessible', async function(assert) {
      // when
      await visit('/sessions/liste');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

    test('it should show title indicating that the user can create a session', async function(assert) {
      // when
      await visit('/sessions/liste');

      // then
      assert.dom('.page-title').hasText('Créez votre première session de certification');
    });

    module('when some sessions exist', function() {
      const nbExtraSessions = 11;

      test('it should list the sessions and their attributes', async function(assert) {
        // given
        const firstSession = server.create('session', { address: 'Adresse', certificationCenterId, date: '2020-01-01', time: '14:00' });
        server.createList('session', nbExtraSessions, { certificationCenterId, date: '2019-01-01' });

        // when
        await visit('/sessions/liste');

        // then
        const formattedDate = moment(firstSession.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
        assert.dom('table tbody tr').exists({ count: nbExtraSessions + 1 });
        assert.dom('table tbody tr:first-child').hasText(`${firstSession.id} ${firstSession.address} ${firstSession.room} ${formattedDate} ${firstSession.time} ${firstSession.examiner}`);
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

      module('When finalization feature is active', function() {

        test('it should list the sessions and their attributes with statut', async function(assert) {
          // given
          const controller = this.owner.lookup('controller:authenticated.sessions.list');
          controller.set('isSessionFinalizationActive', true);
          const firstSession = server.create('session', { address: 'Adresse', certificationCenterId, date: '2020-01-01', time: '14:00' });
          server.createList('session', nbExtraSessions, { certificationCenterId, date: '2019-01-01' });

          // when
          await visit('/sessions/liste');

          // then
          const formattedDate = moment(firstSession.date, 'YYYY-MM-DD').format('DD/MM/YYYY');
          assert.dom('table tbody tr').exists({ count: nbExtraSessions + 1 });
          assert.dom('table tbody tr:first-child').hasText(`${firstSession.id} ${firstSession.address} ${firstSession.room} ${formattedDate} ${firstSession.time} ${firstSession.examiner} ${statusToDisplayName.created}`);
        });
      });

    });
  });
});
