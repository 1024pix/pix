import { module, test } from 'qunit';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';

import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Team::InviteForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('inviteStub', sinon.stub());
    this.set('cancelStub', sinon.stub());
    this.set('updateEmailStub', sinon.stub());
  });

  test('it contains email input and validation button', async function (assert) {
    // when
    await render(
      hbs`<Team::InviteForm @onSubmit={{this.inviteStub}} @onCancel={{this.cancelStub}} @onUpdateEmail={{this.updateEmailStub}} />`,
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
  @onSubmit={{this.inviteStub}}
  @onCancel={{this.cancelStub}}
  @onUpdateEmail={{this.updateEmailStub}}
/>`,
    );

    // when
    const inputLabel = this.intl.t('pages.team-invite.input-label');
    await fillByLabel(inputLabel, 'dev@example.net');

    // then
    assert.ok(this.updateEmailStub.called);
  });

  module('when clicking on the "submit" button', function () {
    test('calls the submit function', async function (assert) {
      // Given
      this.set(
        'inviteStub',
        sinon.stub().callsFake((event) => event.preventDefault()),
      );
      this.set('email', 'dev@example.fr');

      // When
      await render(
        hbs`<Team::InviteForm @email={{this.email}} @onSubmit={{this.inviteStub}} @onCancel={{this.cancelStub}} @onUpdateEmail={{this.updateEmailStub}} />`,
      );
      await clickByName(this.intl.t('pages.team-invite.invite-button'));

      // Then
      assert.ok(this.inviteStub.called);
    });
  });

  module('when clicking on the "cancel" button', function () {
    test('calls the cancel function', async function (assert) {
      // When
      await render(
        hbs`<Team::InviteForm @onSubmit={{this.inviteStub}} @onCancel={{this.cancelStub}} @onUpdateEmail={{this.updateEmailStub}} />`,
      );
      await clickByName(this.intl.t('common.actions.cancel'));

      // Then
      assert.ok(this.cancelStub.called);
    });
  });
});
