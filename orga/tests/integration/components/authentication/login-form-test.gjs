import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import LoginForm from 'pix-orga/components/authentication/login-form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | LoginForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it calls onSubmit with appropriate parameters', async function (assert) {
    // given
    const onSubmitStub = sinon.stub();
    await render(<template><LoginForm @onSubmit={{onSubmitStub}} /></template>);
    await fillByLabel(t('pages.login-form.email.label'), 'pix@example.net');
    await fillByLabel(t('pages.login-form.password'), 'JeMeLoggue1024');

    // when
    await clickByName(t('pages.login-form.login'));

    // then
    assert.ok(onSubmitStub.calledWith('pix@example.net', 'JeMeLoggue1024'));
  });

  module('when form is invalid', function () {
    test('does not call onSubmit', async function (assert) {
      // given
      const onSubmitStub = sinon.stub();
      await render(<template><LoginForm @onSubmit={{onSubmitStub}} /></template>);
      await fillByLabel(t('pages.login-form.email.label'), '');
      await fillByLabel(t('pages.login-form.password'), 'pix123');

      // when
      await clickByName(t('pages.login-form.login'));

      // then
      assert.ok(onSubmitStub.notCalled);
    });
  });

  module('when an error message is given', function () {
    test('it displays an error message', async function (assert) {
      // given & when
      const onSubmitStub = sinon.stub();
      const screen = await render(
        <template><LoginForm @onSubmit={{onSubmitStub}} @errorMessage="This is an error" /></template>,
      );

      // then
      assert.dom(screen.getByText('This is an error')).exists();
    });
  });

  module('when there is an organization access error during an OIDC authentication', function () {
    test('it displays an error message', async function (assert) {
      // given & when
      const onSubmitStub = sinon.stub();
      const screen = await render(
        <template>
          <LoginForm @onSubmit={{onSubmitStub}} @errorMessage={{t "pages.login-form.errors.access-not-allowed"}} />
        </template>,
      );

      // then
      assert.dom(screen.getByText(t('pages.login-form.errors.access-not-allowed'))).exists();
    });
  });
});
