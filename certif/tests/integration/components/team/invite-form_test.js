import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

import { fillByLabel } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Team::InviteForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('inviteSpy', () => {});
    this.set('cancelSpy', () => {});
    this.set('updateEmail', sinon.spy());
  });

  test('it contains email input and validation button', async function (assert) {
    // when
    await render(
      hbs`<Team::InviteForm @onSubmit={{this.inviteSpy}} @onCancel={{this.cancelSpy}} @onUpdateEmail={{this.updateEmail}} />`,
    );

    // then
    assert.dom('#email').exists();
    assert.dom('#email').isRequired();
    assert.dom('button[type="submit"]').exists();
  });

  test('it binds certification center properties with email form input', async function (assert) {
    // given
    this.set('email', 'toto@org.fr');
    await render(
      hbs`<Team::InviteForm
  @email={{this.email}}
  @onSubmit={{this.inviteSpy}}
  @onCancel={{this.cancelSpy}}
  @onUpdateEmail={{this.updateEmail}}
/>`,
    );

    // when
    const inputLabel = this.intl.t('pages.team-invite.input-label');
    await fillByLabel(inputLabel, 'dev@example.net');

    // then
    assert.ok(this.updateEmail.called);
  });
});
