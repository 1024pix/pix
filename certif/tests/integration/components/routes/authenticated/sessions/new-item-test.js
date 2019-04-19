import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | routes/authenticated/session | new-item', function(hooks) {
  setupRenderingTest(hooks);
  let session;

  hooks.beforeEach(function() {
    session = EmberObject.create({});
    this.set('createSessionSpy', (newSession) => {
      session = newSession;
    });
    this.set('cancelSpy', () => {});
  });

  test('it should contain inputs, attributes and validation button', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/sessions/new-item createSession=(action createSessionSpy) cancel=(action cancelSpy)}}`);

    // then
    assert.dom('#session-address').exists();
    assert.dom('#session-room').exists();
    assert.dom('#session-date').exists();
    assert.dom('#session-time').exists();
    assert.dom('#session-examiner').exists();
    assert.dom('#session-description').exists();
    assert.dom('button[type="submit"]').exists();
    assert.dom('#session-description').hasAttribute('maxLength', '350');
  });

  test('it should send session new action when submitted', async function(assert) {
    // given
    this.set('model', session);

    // when
    await render(hbs`{{routes/authenticated/sessions/new-item session=model createSession=(action createSessionSpy) cancel=(action cancelSpy)}}`);

    // then
    await fillIn('#session-address', 'New address');
    await click('button[type="submit"]');

    assert.deepEqual(session.get('address'), 'New address');
  });
});
