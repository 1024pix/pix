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

  hooks.beforeEach(async function() {
    await authenticateSession({ userId: 1 });
    session = this.server.create('session', {
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
    });
  });

  test('it renders the details page with correct info', async function(assert) {
    // when
    await visit(`/certifications/sessions/${session.id}`);

    // then
    const mainDiv = '.certifications-session-info';
    const row = '.row:nth-child';
    const col = '.col:nth-child(2)';
    assert.equal(currentURL(), `/certifications/sessions/${session.id}`);
    assert.equal(find(`${mainDiv} ${row}(1) ${col}`).textContent, session.certificationCenter);
    assert.equal(find(`${mainDiv} ${row}(2) ${col}`).textContent, session.address);
    assert.equal(find(`${mainDiv} ${row}(3) ${col}`).textContent, session.room);
    assert.equal(find(`${mainDiv} ${row}(4) ${col}`).textContent, session.examiner);
    assert.equal(find(`${mainDiv} ${row}(5) ${col}`).textContent, moment(session.date, 'YYYY-MM-DD').format('DD/MM/YYYY'));
    assert.equal(find(`${mainDiv} ${row}(6) ${col}`).textContent, session.time);
    assert.equal(find(`${mainDiv} ${row}(7) ${col}`).textContent, session.description);
    assert.equal(find(`${mainDiv} ${row}(8) ${col}`).textContent, session.accessCode);
    assert.equal(find(`${mainDiv} ${row}(9) ${col}`), undefined);
  });

});
