import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | routes/authenticated/team/new-item', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('createOrganizationInvitationSpy', () => {});
    this.set('cancelSpy', () => {});
  });

  test('it should contain email input and validation button', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/team/new-item createOrganizationInvitation=(action createOrganizationInvitationSpy) cancel=(action cancelSpy)}}`);

    // then
    assert.dom('#email').exists();
    assert.dom('button[type="submit"]').exists();
  });

  test('it should bind organizationInvitation properties with email form input', async function(assert) {
    // given
    this.set('organizationInvitation', EmberObject.create({ organizationInvitation: { email: 'toto@org.fr' } }));
    await render(hbs`{{routes/authenticated/team/new-item organizationInvitation=organizationInvitation createOrganizationInvitation=(action createOrganizationInvitationSpy) cancel=(action cancelSpy)}}`);

    // when
    await fillIn('#email', 'dev@example.net');

    // then
    assert.deepEqual(this.get('organizationInvitation.email'), 'dev@example.net');
  });
});
