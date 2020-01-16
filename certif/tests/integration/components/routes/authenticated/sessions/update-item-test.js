import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | routes/authenticated/session | update-item', function(hooks) {
  setupRenderingTest(hooks);
  let session;
  let updateSessionStub;

  hooks.beforeEach(function() {
    session = EmberObject.create({ });
    session.set('address', '20 rue du gros chat');
    session.set('room', '2B');
    session.set('date', '2028-05-26');
    session.set('time', '20:00');
    session.set('examiner', 'Monsieur Rougeaud');
    updateSessionStub = sinon.stub().callsFake(function fakeFn(event) {
      event.preventDefault();
    });
    this.set('updateSessionSpy', updateSessionStub);
    this.set('cancelSpy', () => {});
    this.set('model', session);
  });

  test('it should contain inputs, attributes and validation button', async function(assert) {
    // when
    await render(hbs`
        <Routes::Authenticated::Sessions::UpdateItem
          @session={{this.model}}
          @updateSession={{this.updateSessionSpy}}
          @cancel={{this.cancelSpy}}
        />`);

    // then
    assert.dom('button[type="submit"]').exists();
    assert.dom('[data-test-id="session-form__cancel-button"]').exists();
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
    await render(hbs`
        <Routes::Authenticated::Sessions::UpdateItem
          @session={{this.model}}
          @updateSession={{this.updateSessionSpy}}
          @cancel={{this.cancelSpy}}
        />`);

    // then
    assert.dom('#session-address').hasValue(session.address);
    assert.dom('#session-room').hasValue(session.room);
    assert.dom('#session-date').hasValue(session.date);
    assert.dom('#session-time').hasValue(session.time);
    assert.dom('#session-examiner').hasValue(session.examiner);
  });

  test('it should call the updatesession action when submitted', async function(assert) {
    // given
    this.set('model', session);

    // when
    await render(hbs`
        <Routes::Authenticated::Sessions::UpdateItem
          @session={{this.model}}
          @updateSession={{this.updateSessionSpy}}
          @cancel={{this.cancelSpy}}
        />`);

    // then
    await fillIn('#session-room', 'New room');
    await click('[data-test-id="session-form__submit-button"]');

    assert.equal(updateSessionStub.called, true);
  });
});
