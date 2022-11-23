import { module, test } from 'qunit';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { contains } from '../../../../../helpers/contains';
import { clickByLabel } from '../../../../../helpers/click-by-label';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/campaigns/profiles_collection/send-profile', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when isDisabled is true', function () {
    test('should not display the share results button', async function (assert) {
      // given
      this.set('isDisabled', true);
      this.set('campaignParticipation', { isShared: false });

      // when
      await render(
        hbs`<Routes::Campaigns::ProfilesCollection::SendProfile @isDisabled={{this.isDisabled}} @campaignParticipation={{this.campaignParticipation}} />`
      );

      assert.notOk(contains(this.intl.t('pages.send-profile.form.send')));
    });
  });

  module('when isDisabled is false', function () {
    test('should call sendProfile property', async function (assert) {
      // given
      const sendProfile = sinon.stub();
      this.set('isDisabled', false);
      this.set('sendProfile', sendProfile);
      this.set('campaignParticipation', { isShared: false });

      // when
      await render(
        hbs`<Routes::Campaigns::ProfilesCollection::SendProfile @isDisabled={{this.isDisabled}} @campaignParticipation={{this.campaignParticipation}} @sendProfile={{this.sendProfile}} />`
      );
      await clickByLabel(this.intl.t('pages.send-profile.form.send'));

      sinon.assert.called(sendProfile);
      assert.ok(true);
    });
  });
});
