import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';

import hbs from 'htmlbars-inline-precompile';

import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Team::InviteForm', function(hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('inviteSpy', () => {});
    this.set('cancelSpy', () => {});
  });

  test('it should contain email input and validation button', async function(assert) {
    // when
    await render(hbs `<Team::InviteForm @onSubmit={{inviteSpy}} @onCancel={{cancelSpy}} />`);

    // then
    assert.dom('#email').exists();
    assert.dom('#email').isRequired();
    assert.dom('button[type="submit"]').exists();
  });

  test('it should bind organizationInvitation properties with email form input', async function(assert) {
    // given
    this.set('email', 'toto@org.fr');
    await render(hbs`<Team::InviteForm @email={{email}} @onSubmit={{inviteSpy}} @onCancel={{cancelSpy}}/>`);

    // when
    const inputLabel = this.intl.t('pages.team-new-item.input-label');
    await fillInByLabel(inputLabel, 'dev@example.net');

    // then
    assert.deepEqual(this.email, 'dev@example.net');
  });
});
