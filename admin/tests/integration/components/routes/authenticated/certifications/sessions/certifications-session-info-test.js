import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { visit, currentURL, find } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { FINALIZED, CREATED, PROCESSED, statusToDisplayName } from 'pix-admin/models/session';

import moment from 'moment';

module('Integration | Component | certifications-session-info', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let sessionId;
  let session;
  let initialSessionData;

  hooks.beforeEach(async function() {
    await authenticateSession({ userId: 1 });
    sessionId = 1;

    this.server.create('certification', {
      sessionId,
      examinerComment: 'ok',
      status: 'validated',
      hasSeenEndTestScreen: 'false'
    });
    this.server.create('certification', { sessionId, status: 'validated', hasSeenEndTestScreen: 'true' });

    initialSessionData = {
      id: sessionId,
      certificationCenter: 'Tour Gamma',
      address: '3 rue du tout',
      room: 'room',
      examiner: 'poulet',
      date: '1999-01-01',
      time: '14:00:00',
      status: FINALIZED,
      description: 'pouet',
      accessCode: '123',
      relationships: {
        certifications: {
          links: {
            related: `/api/sessions/${sessionId}/certifications`
          }
        }
      },
    };
  });

  test('it renders the details page with correct info', async function(assert) {
    // given
    const session = this.server.create('session', initialSessionData);

    // when
    await visit(`/certifications/sessions/${sessionId}`);

    // then
    assert.equal(currentURL(), `/certifications/sessions/${sessionId}`);
    assert.dom('[data-test-id="certifications-session-info__certification-center"]').hasText(session.certificationCenter);
    assert.dom('[data-test-id="certifications-session-info__address"]').hasText(session.address);
    assert.dom('[data-test-id="certifications-session-info__room"]').hasText(session.room);
    assert.dom('[data-test-id="certifications-session-info__examiner"]').hasText(session.examiner);
    assert.dom('[data-test-id="certifications-session-info__date"]').hasText(moment(session.date, 'YYYY-MM-DD').format('DD/MM/YYYY'));
    assert.dom('[data-test-id="certifications-session-info__time"]').hasText(session.time);
    assert.dom('[data-test-id="certifications-session-info__description"]').hasText(session.description);
    assert.dom('[data-test-id="certifications-session-info__access-code"]').hasText(session.accessCode);
    assert.dom('[data-test-id="certifications-session-info__count-commentaries"]').hasText('1');
    assert.dom('[data-test-id="certifications-session-info__count-not-checked-end-screen"]').hasText('1');
    assert.dom('[data-test-id="certifications-session-info__count-non-validated-certifications"]').hasText('0');
  });

  [
    CREATED,
    FINALIZED,
    PROCESSED,
  ].forEach((status) => {
    module(`when the session is "${status}"`, function() {
      const displayStatus = statusToDisplayName[status];

      test(`it renders the status row with "${displayStatus}" value`, async function(assert) {
        // given
        this.server.create('session', { ...initialSessionData, status });

        // when
        await visit(`/certifications/sessions/${sessionId}`);

        // then
        assert.dom('[data-test-id="certifications-session-info__status"]').hasText(displayStatus);
      });
    });
  });

  module('when the session has not been finalized', function(hooks) {

    hooks.beforeEach(async function() {
      // given
      const sessionData = {
        ...initialSessionData,
        status: CREATED,
        examinerGlobalComment: 'AAA'
      };
      session = this.server.create('session', sessionData);

      // when
      await visit(`/certifications/sessions/${sessionId}`);
    });

    test('it renders the status row with no finalized value', async function(assert) {
      assert.dom('[data-test-id="certifications-session-info__finalized-at"]').doesNotExist();
    });

    test('it does not render the examinerGlobalComment row', async function(assert) {
      assert.equal(find('[data-test-id="certifications-session-info__examiner-global-comment"]'), undefined);
    });
  });

  module('when the session has been finalized', function(hooks) {
    let now;
    let sessionData;

    hooks.beforeEach(async function() {
      // given
      now = new Date();
      sessionData = { ...initialSessionData, status: FINALIZED, finalizedAt: now, examinerGlobalComment: '' };
    });

    test('it renders the finalization date', async function(assert) {
      session = this.server.create('session', sessionData);

      // when
      await visit(`/certifications/sessions/${sessionId}`);

      assert.dom('[data-test-id="certifications-session-info__finalized-at"]').hasText(now.toLocaleString('fr-FR'));
    });

    test('it renders the examinerGlobalComment if any', async function(assert) {
      // given
      sessionData.examinerGlobalComment = 'Bonjour je suis le commentaire du surveillant';
      session = this.server.create('session', sessionData);

      // when
      await visit(`/certifications/sessions/${sessionId}`);

      assert.dom('[data-test-id="certifications-session-info__examiner-global-comment"]').hasText(session.examinerGlobalComment);
    });

    test('it does not render the examinerGlobalComment row if no comment', async function(assert) {
      // given
      sessionData.examinerGlobalComment = '';
      session = this.server.create('session', sessionData);

      // when
      await visit(`/certifications/sessions/${sessionId}`);

      assert.equal(find('[data-test-id="certifications-session-info__examiner-global-comment"]'), undefined);
    });
  });
});
