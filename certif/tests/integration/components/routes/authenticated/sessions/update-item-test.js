import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

module('Integration | Component | routes/authenticated/session | session-form', function(hooks) {
  setupRenderingTest(hooks);
  let session;

  hooks.beforeEach(function() {
    session = new EmberObject({ });
    session.set('address', '20 rue du gros chat');
    session.set('room', '2B');
    session.set('date', '2028-05-26T22:00:00.000Z');
    session.set('time', '20:00');
    session.set('examiner', 'Monsieur Rougeaud');
    this.set('saveSessionSpy', (savedSession) => {
      session = savedSession;
    });
    this.set('cancelSpy', () => {});
  });

  test('it should contain inputs, attributes and validation button', async function(assert) {
    // given
    this.set('model', session);

    // when
    await render(hbs`{{routes/authenticated/sessions/session-form session=model saveSession=(action saveSessionSpy) cancel=(action cancelSpy) isNewSession=false}}`);

    // then
    assert.dom('button[type="submit"]').exists();
    assert.dom('button[data-action="cancel"]').exists();
    assert.dom('#session-address').exists();
    assert.dom('#session-room').exists();
    assert.dom('#session-date').exists();
    assert.dom('#session-time').exists();
    assert.dom('#session-examiner').exists();
    assert.dom('#session-description').exists();
  });

  test('it should fill inputs with session attributes values', async function(assert) {
    // given
    this.set('model', session);

    // when
    await render(hbs`{{routes/authenticated/sessions/session-form session=model saveSession=(action saveSessionSpy) cancel=(action cancelSpy) isNewSession=false}}`);

    // then
    const expectedDate = moment(session.get('date')).format('DD/MM/YYYY');

    assert.dom('#session-address').hasValue(session.get('address'));
    assert.dom('#session-room').hasValue(session.get('room'));
    assert.dom('#session-date').hasValue(expectedDate);
    assert.dom('#session-time').hasValue(session.get('time'));
    assert.dom('#session-examiner').hasValue(session.get('examiner'));
  });

  test('it should save session information when submitted', async function(assert) {
    // given
    this.set('model', session);

    // when
    await render(hbs`{{routes/authenticated/sessions/session-form session=model saveSession=(action saveSessionSpy) cancel=(action cancelSpy) isNewSession=false}}`);

    // then
    await fillIn('#session-room', 'New room');
    await click('button[type="submit"]');

    assert.deepEqual(session.get('room'), 'New room');
  });
});
