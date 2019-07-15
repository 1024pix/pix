import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | routes/authenticated/team/new-item', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('addTeamMemberSpy', () => {});
    this.set('cancelSpy', () => {});
  });

  test('it should contain email input and validation button', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/team/new-item addTeamMember=(action addTeamMemberSpy) cancel=(action cancelSpy)}}`);

    // then
    assert.dom('#email').exists();
    assert.dom('button[type="submit"]').exists();
  });

  test('it should send membership creation action when submitted', async function(assert) {
    // given
    this.set('model', EmberObject.create({ membership: {} }));

    // when
    await render(hbs`{{routes/authenticated/team/new-item membership=model.membership email=email addTeamMember=(action addTeamMemberSpy) cancel=(action cancelSpy)}}`);

    // then
    await fillIn('#email', 'dev@example.net');
    await click('button[type="submit"]');

    assert.deepEqual(this.get('email'), 'dev@example.net');
  });
});
