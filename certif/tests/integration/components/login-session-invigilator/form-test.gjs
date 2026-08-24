import { render, within } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import LoginSessionInvigilatorForm from 'pix-certif/components/login-session-invigilator/form';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Login session invigilator | Form', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should render invigilator login form', async function (assert) {
    // when
    const screen = await render(<template><LoginSessionInvigilatorForm /></template>);

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
        const authenticateInvigilator = sinon.stub().rejects({ errors: [{ code: 'SESSION_NOT_FOUND' }] });

        // when
        const screen = await render(
          <template><LoginSessionInvigilatorForm @authenticateInvigilator={{authenticateInvigilator}} /></template>,
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
        assert.ok(authenticateInvigilator.called);
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
        const authenticateInvigilator = sinon
          .stub()
          .rejects({ errors: [{ code: 'CERTIFICATION_CENTER_IS_ARCHIVED' }] });

        // when
        const screen = await render(
          <template><LoginSessionInvigilatorForm @authenticateInvigilator={{authenticateInvigilator}} /></template>,
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
        assert.ok(authenticateInvigilator.called);
        assert
          .dom(
            within(screen.getByRole('alert')).getByText(
              t('pages.session-supervising.login.form.errors.certification-center-archived'),
            ),
          )
          .exists();
      });
    });

    module('when the session is finalized', function () {
      test('it should display a session finalized error', async function (assert) {
        // given
        const authenticateInvigilator = sinon.stub().rejects({ errors: [{ code: 'SESSION_FINALIZED' }] });

        // when
        const screen = await render(
          <template><LoginSessionInvigilatorForm @authenticateInvigilator={{authenticateInvigilator}} /></template>,
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
        assert.ok(authenticateInvigilator.called);
        assert
          .dom(
            within(screen.getByRole('alert')).getByText(
              t('pages.session-supervising.login.form.errors.session-finalized'),
            ),
          )
          .exists();
      });
    });

    module('when the session is not accessible', function () {
      test('it should display an error with the blocked access date', async function (assert) {
        // given
        const blockedAccessDate = '2025-09-01';
        const authenticateInvigilator = sinon
          .stub()
          .rejects({ errors: [{ code: 'SESSION_NOT_JOINABLE', meta: { blockedAccessDate } }] });

        // when
        const screen = await render(
          <template><LoginSessionInvigilatorForm @authenticateInvigilator={{authenticateInvigilator}} /></template>,
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
        assert.ok(authenticateInvigilator.called);
        assert
          .dom(
            within(screen.getByRole('alert')).getByText(
              t('pages.session-supervising.login.form.errors.session-not-joinable', { date: '01/09/2025' }),
            ),
          )
          .exists();
      });
    });

    module('on success', function () {
      test('it should not display an error', async function (assert) {
        // given
        const authenticateInvigilator = sinon.stub();

        // when
        const screen = await render(
          <template><LoginSessionInvigilatorForm @authenticateInvigilator={{authenticateInvigilator}} /></template>,
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
        assert.ok(authenticateInvigilator.called);
        assert.notOk(screen.queryByRole('alert'));
      });
    });
  });
});
