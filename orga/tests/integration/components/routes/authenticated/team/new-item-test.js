import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import fillInByLabel from '../../../../../helpers/extended-ember-test-helpers/fill-in-by-label';
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
    await render(hbs`<Routes::Authenticated::Team::NewItem @createOrganizationInvitation={{createOrganizationInvitationSpy}} @cancel={{cancelSpy}}/>`);

    // then
    assert.dom('#email').exists();
    assert.dom('#email').isRequired();
    assert.dom('button[type="submit"]').exists();
  });

  test('it should bind organizationInvitation properties with email form input', async function(assert) {
    // given
    this.set('organizationInvitation', EmberObject.create({ organizationInvitation: { email: 'toto@org.fr' } }));
    await render(hbs`<Routes::Authenticated::Team::NewItem @organizationInvitation={{organizationInvitation}} @createOrganizationInvitation={{createOrganizationInvitationSpy}} @cancel={{cancelSpy}}/>`);

    // when
    await fillInByLabel('Adresse(s) e-mail', 'dev@example.net');

    // then
    assert.deepEqual(this.organizationInvitation.email, 'dev@example.net');
  });
});
