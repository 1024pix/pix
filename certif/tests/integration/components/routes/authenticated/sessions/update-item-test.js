import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/session | update-item', function(hooks) {
  setupRenderingTest(hooks);
  let session;

  hooks.beforeEach(function() {
    session = EmberObject.create({ });
    session.set('address', '20 rue du gros chat');
    session.set('room', '2B');
    session.set('date', '2028-05-26');
    session.set('time', '20:00');
    session.set('examiner', 'Monsieur Rougeaud');
    this.set('updateSessionSpy', (updatedSession) => {
      session = updatedSession;
    });
    this.set('cancelSpy', () => {});
  });

  test('it should contain inputs, attributes and validation button', async function(assert) {
    // given
    this.set('model', session);

    // when
    await render(hbs`{{routes/authenticated/sessions/update-item session=model updateSession=(action updateSessionSpy) cancel=(action cancelSpy)}}`);

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
    await render(hbs`{{routes/authenticated/sessions/update-item session=model updateSession=(action updateSessionSpy) cancel=(action cancelSpy)}}`);

    // then
    assert.dom('#session-address').hasValue(session.get('address'));
    assert.dom('#session-room').hasValue(session.get('room'));
    assert.dom('#session-date').hasValue(session.get('date'));
    assert.dom('#session-time').hasValue(session.get('time'));
    assert.dom('#session-examiner').hasValue(session.get('examiner'));
  });

  test('it should update session information when submitted', async function(assert) {
    // given
    this.set('model', session);

    // when
    await render(hbs`{{routes/authenticated/sessions/update-item session=model updateSession=(action updateSessionSpy) cancel=(action cancelSpy)}}`);

    // then
    await fillIn('#session-room', 'New room');
    await click('button[type="submit"]');

    assert.deepEqual(session.get('room'), 'New room');
  });
});
