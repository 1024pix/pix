import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { visit, currentURL, find } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import moment from 'moment';

module('Integration | Component | certifications-session-info', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let session;
  let sessionData;

  hooks.beforeEach(async function() {
    await authenticateSession({ userId: 1 });
    sessionData = {
      id: 1,
      certificationCenter: 'Tour Gamma',
      address: '3 rue du tout',
      room: 'room',
      examiner: 'poulet',
      date: '1999-01-01',
      time: '14:00:00',
      description: 'pouet',
      accessCode: '123',
      certifications: [],
    };
  });

  test('it renders the details page with correct info', async function(assert) {
    // given
    session = this.server.create('session', sessionData);

    // when
    await visit(`/certifications/sessions/${session.id}`);

    // then
    assert.equal(currentURL(), `/certifications/sessions/${session.id}`);
    assert.dom('[data-test-id="certifications-session-info__certification-center"]').hasText(session.certificationCenter);
    assert.dom('[data-test-id="certifications-session-info__address"]').hasText(session.address);
    assert.dom('[data-test-id="certifications-session-info__room"]').hasText(session.room);
    assert.dom('[data-test-id="certifications-session-info__examiner"]').hasText(session.examiner);
    assert.dom('[data-test-id="certifications-session-info__date"]').hasText(moment(session.date, 'YYYY-MM-DD').format('DD/MM/YYYY'));
    assert.dom('[data-test-id="certifications-session-info__time"]').hasText(session.time);
    assert.dom('[data-test-id="certifications-session-info__description"]').hasText(session.description);
    assert.dom('[data-test-id="certifications-session-info__access-code"]').hasText(session.accessCode);
    assert.dom('[data-test-id="certifications-session-info__count-non-validated-certifications"]').hasText('0');
  });

  module('when the session is finalized', function() {

    test('it renders the status row with finalized value', async function(assert) {
      // given
      sessionData.status = 'finalized';
      session = this.server.create('session', sessionData);

      // when
      await visit(`/certifications/sessions/${session.id}`);

      // then
      assert.dom('[data-test-id="certifications-session-info__is-finalized"]').hasText('Finalisée');
    });

    test('it renders the examinerComment if any', async function(assert) {
      // given
      sessionData.status = 'finalized';
      sessionData.examinerComment = 'Bonjour je suis le commentaire du surveillant';
      session = this.server.create('session', sessionData);

      // when
      await visit(`/certifications/sessions/${session.id}`);

      assert.dom('[data-test-id="certifications-session-info__examiner-comment"]').hasText(session.examinerComment);
    });

    test('it does not render the examinerComment row if no comment', async function(assert) {
      // given
      sessionData.status = 'finalized';
      sessionData.examinerComment = '';
      session = this.server.create('session', sessionData);

      // when
      await visit(`/certifications/sessions/${session.id}`);

      assert.equal(find('[data-test-id="certifications-session-info__examiner-comment"]'), undefined);
    });
  });

  module('when the session is not finalized', function() {

    test('it renders the status row with not finalized value', async function(assert) {
      // given
      sessionData.status = 'started';
      session = this.server.create('session', sessionData);

      // when
      await visit(`/certifications/sessions/${session.id}`);

      // then
      assert.dom('[data-test-id="certifications-session-info__is-finalized"]').hasText('Prête');
    });

    test('it does not render the examinerComment row', async function(assert) {
      // given
      sessionData.status = 'started';
      sessionData.examinerComment = 'AAA';
      session = this.server.create('session', sessionData);

      // when
      await visit(`/certifications/sessions/${session.id}`);

      assert.equal(find('[data-test-id="certifications-session-info__examiner-comment"]'), undefined);
    });
  });

});
