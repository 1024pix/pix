import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { visit, currentURL, find } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import {
  FINALIZED,
  CREATED,
  statusToDisplayName
} from 'pix-admin/models/session';

import moment from 'moment';

module('Integration | Component | routes/authenticated/sessions/session | informations', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certifications;
  let sessionId;
  let session;
  let sessionData;

  hooks.beforeEach(async function() {
    await authenticateSession({ userId: 1 });
    sessionId = 1;

    const certif1 = this.server.create('certification', { sessionId, examinerComment: 'ok', status: 'validated', hasSeenEndTestScreen: 'false' });
    const certif2 = this.server.create('certification', { sessionId, status: 'validated', hasSeenEndTestScreen: 'true' });
    certifications = [certif1, certif2];

    sessionData = {
      id: sessionId,
      address: '3 rue du tout',
      room: 'room',
      examiner: 'poulet',
      date: '1999-01-01',
      time: '14:00:00',
      status: FINALIZED,
      description: 'pouet',
      accessCode: '123',
      examinerGlobalComment: 'Salut',
      certifications,
    };
  });

  test('it renders the details page with correct info', async function(assert) {
    // given
    session = this.server.create('session', sessionData, 'finalized');

    // when
    await visit(`/sessions/${sessionId}`);

    // then
    assert.equal(currentURL(), `/sessions/${sessionId}`);
    assert.dom('.session-info__details div:nth-child(2) div:last-child').hasText(session.address);
    assert.dom('.session-info__details div:nth-child(3) div:last-child').hasText(session.room);
    assert.dom('.session-info__details div:nth-child(4) div:last-child').hasText(session.examiner);
    assert.dom('.session-info__details div:nth-child(5) div:last-child').hasText(moment(session.date, 'YYYY-MM-DD').format('DD/MM/YYYY'));
    assert.dom('.session-info__details div:nth-child(6) div:last-child').hasText(session.time);
    assert.dom('.session-info__details div:nth-child(7) div:last-child').hasText(session.description);
    assert.dom('.session-info__details div:nth-child(8) div:last-child').hasText(session.accessCode);
    assert.dom('.session-info__details div:nth-child(9) div:last-child').hasText(statusToDisplayName[FINALIZED]);
    assert.dom('.session-info__stats div:nth-child(1) div:last-child').hasText('1');
    assert.dom('.session-info__stats div:nth-child(2) div:last-child').hasText('1');
    assert.dom('.session-info__stats div:nth-child(3) div:last-child').hasText('0');
    assert.dom('.session-info__stats div:nth-child(4) div:last-child').hasText(session.examinerGlobalComment);
  });

  module('when the session is linked to a real certification center', function() {

    test('it should display the same name as the linked certification center name', async function(assert) {
      // given
      session = this.server.create('session', sessionData, 'withCertificationCenter');

      // when
      await visit(`/sessions/${sessionId}`);

      // then
      assert.dom('.session-info__details div:nth-child(1) div:last-child').hasText(session.certificationCenter.name);
    });
  });

  module('when the session is not linked to a real certification center', function() {

    test('it should display the certificationCenterName value in session', async function(assert) {
      // given
      session = this.server.create('session', sessionData);

      // when
      await visit(`/sessions/${sessionId}`);

      // then
      assert.dom('.session-info__details div:nth-child(1) div:last-child').hasText(session.certificationCenterName);
    });
  });

  module('when the session is finalized', function() {

    test('it renders the finalization date in correct format', async function(assert) {
      // given
      const now = new Date();
      sessionData.finalizedAt = now;
      session = this.server.create('session', sessionData);

      // when
      await visit(`/sessions/${sessionId}`);

      // then
      assert.dom('.session-info__details div:nth-child(10) div:last-child').hasText(now.toLocaleString('fr-FR'));
    });

    test('it renders the resultSentToPrescriber date in correct format', async function(assert) {
      // given
      const now = new Date();
      sessionData.resultsSentToPrescriberAt = now;
      session = this.server.create('session', sessionData);

      // when
      await visit(`/sessions/${sessionId}`);

      // then
      assert.dom('[data-test-id="session-info__sent-to-prescriber-at"]').hasText(now.toLocaleString('fr-FR'));
    });

    test('it renders all the stats of the session', async function(assert) {
      // given
      sessionData.status = FINALIZED;
      session = this.server.create('session', sessionData);

      // when
      await visit(`/sessions/${sessionId}`);

      // when
      assert.dom('[data-test-id="session-info__number-of-report"]').hasText('1');
      assert.dom('[data-test-id="session-info__number-of-not-checked-end-screen"]').hasText('1');
      assert.dom('[data-test-id="session-info__number-of-not-ended-certifications"]').hasText('0');
    });

    test('it renders the examinerGlobalComment if any', async function(assert) {
      // given
      sessionData.status = FINALIZED;
      sessionData.examinerGlobalComment = 'Bonjour je suis le commentaire du surveillant';
      session = this.server.create('session', sessionData);

      // when
      await visit(`/sessions/${sessionId}`);

      // then
      assert.dom('[data-test-id="session-info__examiner-global-comment"]').hasText(session.examinerGlobalComment);
    });

    test('it does not render the examinerGlobalComment row if no comment', async function(assert) {
      // given
      sessionData.status = FINALIZED;
      sessionData.examinerGlobalComment = '';
      session = this.server.create('session', sessionData);

      // when
      await visit(`/sessions/${sessionId}`);

      assert.equal(find('[data-test-id="session-info__examiner-comment"]'), undefined);
    });
  });

  module('when the session is not finalized', function() {

    test('it renders the status row with not finalized value', async function(assert) {
      // given
      sessionData.status = CREATED;
      session = this.server.create('session', sessionData);

      // when
      await visit(`/sessions/${sessionId}`);

      // then
      assert.dom('.session-info__details div:nth-child(9) div:last-child').hasText(statusToDisplayName.created);
    });

    test('it does not render the examinerGlobalComment row or stats', async function(assert) {
      // given
      sessionData.status = CREATED;
      sessionData.examinerGlobalComment = 'AAA';
      session = this.server.create('session', sessionData);

      // when
      await visit(`/sessions/${sessionId}`);

      assert.equal(find('[data-test-id="session-info__examiner-comment"]'), undefined);
      assert.equal(find('[data-test-id="session-info__number-of-not-checked-end-screen"]'), undefined);
    });
  });
});
