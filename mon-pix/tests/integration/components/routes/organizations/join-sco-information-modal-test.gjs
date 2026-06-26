import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import JoinScoInformationModal from 'mon-pix/components/routes/organizations/join-sco-information-modal';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/organizations/join-sco-information-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when a reconciliation error is provided', function () {
    module('when the error has a 422 status', function () {
      test('displays the "account belonging to another user" information and no continue button', async function (assert) {
        // given
        const reconciliationError = { status: '422' };

        // when
        const screen = await render(
          <template>
            <div id="modal-container">
              <JoinScoInformationModal @reconciliationError={{reconciliationError}} />
            </div>
          </template>,
        );

        // then
        assert.dom(screen.getByText(t('api-error-messages.join-error.r90.account-belonging-to-another-user'))).exists();
        assert.dom(screen.getByRole('button', { name: t('common.actions.quit') })).exists();
        assert.dom(screen.queryByRole('button', { name: t('pages.join.sco.continue-with-pix') })).doesNotExist();
        assert.dom(screen.queryByRole('button', { name: t('pages.join.sco.associate') })).doesNotExist();
      });
    });

    module('when the error has a 409 status', function () {
      module('when the error is not related to a samlId', function () {
        test('displays the error message and a continue button', async function (assert) {
          // given
          const reconciliationError = {
            status: '409',
            meta: { shortCode: 'R11', value: 'j***@example.net', userId: 1 },
          };

          // when
          const screen = await render(
            <template>
              <div id="modal-container">
                <JoinScoInformationModal @reconciliationError={{reconciliationError}} />
              </div>
            </template>,
          );

          // then
          assert
            .dom(
              screen.getByText(
                (content, element) => element?.tagName === 'P' && content.includes(reconciliationError.meta.value),
                { exact: false },
              ),
            )
            .exists();
          assert.dom(screen.getByRole('button', { name: t('pages.join.sco.continue-with-pix') })).exists();
          assert.dom(screen.getByRole('button', { name: t('common.actions.quit') })).exists();
          assert.dom(screen.queryByRole('button', { name: t('pages.join.sco.associate') })).doesNotExist();
        });
      });

      module('when the error is related to a samlId', function () {
        test('does not display a continue button', async function (assert) {
          // given
          const reconciliationError = {
            status: '409',
            meta: { shortCode: 'R13', value: 'j***@example.net', userId: 1 },
          };

          // when
          const screen = await render(
            <template>
              <div id="modal-container">
                <JoinScoInformationModal @reconciliationError={{reconciliationError}} />
              </div>
            </template>,
          );

          // then
          assert.dom(screen.queryByRole('button', { name: t('pages.join.sco.continue-with-pix') })).doesNotExist();
          assert.dom(screen.getByRole('button', { name: t('common.actions.quit') })).exists();
        });
      });
    });
  });

  module('when a reconciliation warning is provided', function () {
    test('displays the information message and the associate/sign-out buttons', async function (assert) {
      // given
      const reconciliationWarning = {
        connectionMethod: 'test@example.net',
        firstName: 'John',
        lastName: 'Doe',
      };

      // when
      const screen = await render(
        <template>
          <div id="modal-container">
            <JoinScoInformationModal @reconciliationWarning={{reconciliationWarning}} />
          </div>
        </template>,
      );

      // then
      assert.dom(screen.getByText(reconciliationWarning.connectionMethod)).exists();
      assert.dom(screen.getByText(`${reconciliationWarning.firstName} ${reconciliationWarning.lastName}`)).exists();
      assert.dom(screen.getByRole('button', { name: t('pages.join.sco.associate') })).exists();
      assert.dom(screen.getByRole('button', { name: t('common.actions.sign-out') })).exists();
      assert.dom(screen.queryByRole('button', { name: t('common.actions.quit') })).doesNotExist();
    });
  });
});
