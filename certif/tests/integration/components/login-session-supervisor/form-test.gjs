import { render, within } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import LoginSessionSupervisorForm from 'pix-certif/components/login-session-supervisor/form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Login session supervisor | Form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should render supervisor login form', async function (assert) {
    // when
    const screen = await render(<template><LoginSessionSupervisorForm /></template>);

    // then
    assert
      .dom(screen.getByLabelText(t('pages.session-supervising.login.form.session-number'), { exact: false }))
      .exists();
    assert
      .dom(screen.getByLabelText(t('pages.session-supervising.login.form.session-password.label'), { exact: false }))
      .exists();
    assert
      .dom(screen.getByRole('button', { name: t('pages.session-supervising.login.form.actions.invigilate') }))
      .exists();
  });

  module('on submit', function () {
    module('on session or password error', function () {
      test('it should display an error', async function (assert) {
        // given
        const authenticateSupervisor = sinon.stub().rejects({ errors: [{ code: 'SESSION_NOT_FOUND' }] });

        // when
        const screen = await render(
          <template><LoginSessionSupervisorForm @authenticateSupervisor={{authenticateSupervisor}} /></template>,
        );

        await fillIn(
          screen.getByLabelText(t('pages.session-supervising.login.form.session-number'), { exact: false }),
          222,
        );
        await fillIn(
          screen.getByLabelText(t('pages.session-supervising.login.form.session-password.label'), { exact: false }),
          222,
        );
        await click(screen.getByRole('button', { name: t('pages.session-supervising.login.form.actions.invigilate') }));

        // then
        assert.ok(authenticateSupervisor.called);
        assert
          .dom(
            within(screen.getByRole('alert')).getByText(
              t('pages.session-supervising.login.form.errors.incorrect-data'),
            ),
          )
          .exists();
      });
    });

    module('when the certification center is archived', function () {
      test('it should display a specific error', async function (assert) {
        // given
        const authenticateSupervisor = sinon.stub().rejects({ errors: [{ code: 'CERTIFICATION_CENTER_IS_ARCHIVED' }] });

        // when
        const screen = await render(
          <template><LoginSessionSupervisorForm @authenticateSupervisor={{authenticateSupervisor}} /></template>,
        );

        await fillIn(
          screen.getByLabelText(t('pages.session-supervising.login.form.session-number'), { exact: false }),
          222,
        );
        await fillIn(
          screen.getByLabelText(t('pages.session-supervising.login.form.session-password.label'), { exact: false }),
          222,
        );
        await click(screen.getByRole('button', { name: t('pages.session-supervising.login.form.actions.invigilate') }));

        // then
        assert.ok(authenticateSupervisor.called);
        assert
          .dom(
            within(screen.getByRole('alert')).getByText(
              t('pages.session-supervising.login.form.errors.certification-center-archived'),
            ),
          )
          .exists();
      });
    });

    module('on success', function () {
      test('it should not display an error', async function (assert) {
        // given
        const authenticateSupervisor = sinon.stub();

        // when
        const screen = await render(
          <template><LoginSessionSupervisorForm @authenticateSupervisor={{authenticateSupervisor}} /></template>,
        );

        await fillIn(
          screen.getByLabelText(t('pages.session-supervising.login.form.session-number'), { exact: false }),
          222,
        );
        await fillIn(
          screen.getByLabelText(t('pages.session-supervising.login.form.session-password.label'), { exact: false }),
          222,
        );
        await click(screen.getByRole('button', { name: t('pages.session-supervising.login.form.actions.invigilate') }));

        // then
        assert.ok(authenticateSupervisor.called);
        assert.notOk(screen.queryByRole('alert'));
      });
    });
  });
});
