import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/campaigns/profiles_collection/send-profile', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when isDisabled is true', function () {
    test('should not display the share results button', async function (assert) {
      // given
      this.set('isDisabled', true);
      this.set('campaignParticipation', { isShared: false });

      // when
      const screen = await render(
        hbs`<Routes::Campaigns::ProfilesCollection::SendProfile
  @isDisabled={{this.isDisabled}}
  @campaignParticipation={{this.campaignParticipation}}
/>`,
      );

      // then
      assert.notOk(screen.queryByRole('button', { name: this.intl.t('pages.send-profile.form.send') }));
    });
  });

  module('when isDisabled is false', function () {
    test('should call sendProfile property', async function (assert) {
      // given
      const sendProfile = sinon.stub();
      this.set('isDisabled', false);
      this.set('sendProfile', sendProfile);
      this.set('campaignParticipation', { isShared: false });
      const screen = await render(
        hbs`<Routes::Campaigns::ProfilesCollection::SendProfile
  @isDisabled={{this.isDisabled}}
  @campaignParticipation={{this.campaignParticipation}}
  @sendProfile={{this.sendProfile}}
/>`,
      );

      // when
      const sendProfileButtons = screen.getAllByRole('button', { name: this.intl.t('pages.send-profile.form.send') });
      await click(sendProfileButtons[0]);

      // then
      sinon.assert.called(sendProfile);
      assert.ok(true);
    });
  });
});
