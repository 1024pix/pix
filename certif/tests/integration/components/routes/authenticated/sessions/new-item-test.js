import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Integration | Component | routes/authenticated/session | new-item', function(hooks) {
  setupRenderingTest(hooks);
  let session;
  let createSessionStub;

  hooks.beforeEach(function() {
    session = EmberObject.create({});
    createSessionStub = sinon.stub().callsFake(function fakeFn(event) {
      event.preventDefault();
    });
    this.set('createSessionSpy', createSessionStub);
    this.set('cancelSpy', () => {});
    this.set('model', session);
  });

  test('it should contain inputs, attributes and validation button', async function(assert) {
    // when
    await render(hbs`
        <Routes::Authenticated::Sessions::NewItem
          @session={{this.model}}
          @createSession={{this.createSessionSpy}}
          @cancel={{this.cancelSpy}}
        />`);

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
    // when
    await render(hbs`
        <Routes::Authenticated::Sessions::NewItem
          @session={{this.model}}
          @createSession={{this.createSessionSpy}}
          @cancel={{this.cancelSpy}}
        />`);

    // then
    await fillIn('#session-address', 'New address');
    await click('[data-test-id="session-form__submit-button"]');

    assert.equal(createSessionStub.called, true);
  });
});
