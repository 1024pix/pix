import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import SendProfile from 'mon-pix/components/routes/campaigns/profiles-collection/send-profile';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/campaigns/profiles_collection/send-profile', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when isDisabled is true', function () {
    test('should not display the share results button', async function (assert) {
      // given
      const isDisabled = true;
      const campaignParticipation = { isShared: false };

      // when
      const screen = await render(
        <template>
          <SendProfile @isDisabled={{isDisabled}} @campaignParticipation={{campaignParticipation}} />
        </template>,
      );

      // then
      assert.notOk(screen.queryByRole('button', { name: t('pages.send-profile.form.send') }));
    });
  });

  module('when isDisabled is false', function () {
    test('should call sendProfile property', async function (assert) {
      // given
      const sendProfile = sinon.stub();
      const isDisabled = false;
      const campaignParticipation = { isShared: false };
      const screen = await render(
        <template>
          <SendProfile
            @isDisabled={{isDisabled}}
            @campaignParticipation={{campaignParticipation}}
            @sendProfile={{sendProfile}}
          />
        </template>,
      );

      // when
      const sendProfileButtons = screen.getAllByRole('button', { name: t('pages.send-profile.form.send') });
      await click(sendProfileButtons[0]);

      // then
      sinon.assert.called(sendProfile);
      assert.ok(true);
    });
  });
});
