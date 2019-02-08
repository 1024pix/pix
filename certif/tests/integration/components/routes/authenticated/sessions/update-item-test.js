import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | routes/authenticated/session | update-item', function(hooks) {
  setupRenderingTest(hooks);
  let session;

  hooks.beforeEach(function() {
    session = new EmberObject({});
    this.set('updateSessionSpy', (updatedSession) => {
      session = updatedSession;
    });
    this.set('cancelSpy', () => {});
  });

  test('it should contain inputs, attributes and validation button', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/sessions/update-item updateSession=(action updateSessionSpy) cancel=(action cancelSpy)}}`);

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

  test('it should send session update action when submitted', async function(assert) {
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
