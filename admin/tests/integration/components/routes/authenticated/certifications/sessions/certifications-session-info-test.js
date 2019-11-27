import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { visit, currentURL, find } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import moment from 'moment';

const CERTIFICATION_CENTER_ROW = '(1)';
const ADDRESS_ROW = '(2)';
const ROOM_ROW = '(3)';
const EXAMINER_ROW = '(4)';
const DATE_ROW = '(5)';
const TIME_ROW = '(6)';
const DESCRIPTION_ROW = '(7)';
const ACCESS_CODE_ROW = '(8)';
const STATUS_ROW = '(9)';
const CHECK_NO_ADDITIONAL_INFO_ROW_EXISTS = '(10)';

module('Integration | Component | certifications-session-info', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let session;
  let sessionData;
  const commonSelector = '.certifications-session-info .row:nth-child';
  const col = '.col:nth-child(2)';

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
      certifications: []
    };
  });

  test('it rendersaaa the details page with correct info when session is finalized', async function(assert) {
    // given
    session = this.server.create('session', sessionData);

    // when
    await visit(`/certifications/sessions/${session.id}`);

    // then
    assert.equal(currentURL(), `/certifications/sessions/${session.id}`);
    assert.equal(find(`${commonSelector}${CERTIFICATION_CENTER_ROW} ${col}`).textContent, session.certificationCenter);
    assert.equal(find(`${commonSelector}${ADDRESS_ROW} ${col}`).textContent, session.address);
    assert.equal(find(`${commonSelector}${ROOM_ROW} ${col}`).textContent, session.room);
    assert.equal(find(`${commonSelector}${EXAMINER_ROW} ${col}`).textContent, session.examiner);
    assert.equal(find(`${commonSelector}${DATE_ROW} ${col}`).textContent, moment(session.date, 'YYYY-MM-DD').format('DD/MM/YYYY'));
    assert.equal(find(`${commonSelector}${TIME_ROW} ${col}`).textContent, session.time);
    assert.equal(find(`${commonSelector}${DESCRIPTION_ROW} ${col}`).textContent, session.description);
    assert.equal(find(`${commonSelector}${ACCESS_CODE_ROW} ${col}`).textContent, session.accessCode);
  });

  test('it should not present unexpected row info', async function(assert) {
    // given
    session = this.server.create('session', sessionData);

    // when
    await visit(`/certifications/sessions/${session.id}`);

    // then
    assert.equal(find(`${commonSelector}${CHECK_NO_ADDITIONAL_INFO_ROW_EXISTS} ${col}`), undefined);
  });

  module('when the session is finalized', function() {

    test('it renders the status row with finalized value', async function(assert) {
      // given
      sessionData.status = 'finalized';
      session = this.server.create('session', sessionData);

      // when
      await visit(`/certifications/sessions/${session.id}`);

      // then
      assert.equal(find(`${commonSelector}${STATUS_ROW} ${col}`).textContent.trim(), 'Finalisée');
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
      assert.equal(find(`${commonSelector}${STATUS_ROW} ${col}`).textContent.trim(), 'Prête');
    });
  });

});
