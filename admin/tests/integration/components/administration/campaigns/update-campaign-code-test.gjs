import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import UpdateCampaignCode from 'pix-admin/components/administration/campaigns/update-campaign-code';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering.js';

module('Integration | Component | administration/update-campaign-code', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store, notificationService, adapter, updateAdapterStub;

  hooks.beforeEach(function () {
    notificationService = this.owner.lookup('service:notifications');
    store = this.owner.lookup('service:store');

    sinon.stub(notificationService, 'success');
    sinon.stub(notificationService, 'clearAll');
    sinon.stub(notificationService, 'error');

    adapter = store.adapterFor('update-campaign-code');
    updateAdapterStub = sinon.stub(adapter, 'updateCampaignCode');
  });

  test("it should update campaign's code", async function (assert) {
    // given
    const campaignId = '18';
    const campaignCode = 'SCOSCO123';

    updateAdapterStub.withArgs({ campaignId, campaignCode }).resolves();

    //when
    const screen = await render(<template><UpdateCampaignCode /></template>);

    await fillIn(
      screen.getByLabelText(t('components.administration.update-campaign-code.form.campaignId')),
      campaignId,
    );
    await fillIn(
      screen.getByLabelText(t('components.administration.update-campaign-code.form.campaignCode')),
      campaignCode,
    );

    await click(
      screen.getByRole('button', {
        name: t('components.administration.update-campaign-code.form.button'),
      }),
    );

    // then
    assert.true(updateAdapterStub.calledOnce);
    assert.true(
      notificationService.success.calledOnceWithExactly(
        t('components.administration.update-campaign-code.notifications.success'),
      ),
    );
    assert.true(notificationService.error.notCalled);
    assert.true(notificationService.clearAll.called);
  });
});
