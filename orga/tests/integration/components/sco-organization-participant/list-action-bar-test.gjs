import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ListActionBar from 'pix-orga/components/sco-organization-participant/list-action-bar';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | ScoOrganizationParticipant::ListActionBar', function (hooks) {
  setupIntlRenderingTest(hooks);

  const openGenerateUsernamePasswordModal = sinon.stub();
  const openResetPasswordModal = sinon.stub();

  module('when rendering the component', function () {
    test('displays student count', async function (assert) {
      // given
      const count = 1;

      // when
      const screen = await render(
        <template>
          <ListActionBar
            @count={{count}}
            @openGenerateUsernamePasswordModal={{openGenerateUsernamePasswordModal}}
            @openResetPasswordModal={{openResetPasswordModal}}
          />
        </template>,
      );

      // then
      assert.ok(screen.getByText(t('pages.sco-organization-participants.action-bar.information', { count })));
    });
  });

  module('When hasGarIdentityProvider arg is at true', function () {
    const hasGarIdentityProvider = true;

    test('displays reset passwords and it works correctly', async function (assert) {
      // given
      const count = 1;

      // when
      const screen = await render(
        <template>
          <ListActionBar
            @count={{count}}
            @hasGarIdentityProvider={{hasGarIdentityProvider}}
            @openGenerateUsernamePasswordModal={{openGenerateUsernamePasswordModal}}
            @openResetPasswordModal={{openResetPasswordModal}}
          />
        </template>,
      );

      const button = screen.getByRole('button', {
        name: t('pages.sco-organization-participants.action-bar.reset-password-button'),
      });

      assert.dom(button).exists();
      await click(button);

      // then
      sinon.assert.called(openResetPasswordModal);
    });
  });

  module('When hasGarIdentityProvider arg is at false', function () {
    const hasGarIdentityProvider = false;

    test('displays generates username password button and it works correctly', async function (assert) {
      // given
      const count = 1;

      // when
      const screen = await render(
        <template>
          <ListActionBar
            @count={{count}}
            @hasGarIdentityProvider={{hasGarIdentityProvider}}
            @openGenerateUsernamePasswordModal={{openGenerateUsernamePasswordModal}}
            @openResetPasswordModal={{openResetPasswordModal}}
          />
        </template>,
      );

      const button = screen.getByRole('button', {
        name: t('pages.sco-organization-participants.action-bar.generate-username-password-button'),
      });

      assert.dom(button).exists();
      await click(button);

      // then
      sinon.assert.called(openGenerateUsernamePasswordModal);
    });
  });
});
