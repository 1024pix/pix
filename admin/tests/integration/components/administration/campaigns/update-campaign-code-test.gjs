import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import UpdateCampaignCode from 'pix-admin/components/administration/campaigns/update-campaign-code';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering.js';

module('Integration | Component | administration/update-campaign-code', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store, notificationService, adapter, updateAdapterStub;

  hooks.beforeEach(function () {
    notificationService = this.owner.lookup('service:pixToast');
    store = this.owner.lookup('service:store');

    sinon.stub(notificationService, 'sendSuccessNotification');
    sinon.stub(notificationService, 'sendErrorNotification');

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
      notificationService.sendSuccessNotification.calledOnceWithExactly({
        message: t('components.administration.update-campaign-code.notifications.success'),
      }),
    );
    assert.true(notificationService.sendErrorNotification.notCalled);
  });

  test('should show error notification when campaign code format is invalid', async function (assert) {
    // given
    const campaignId = '123';
    const campaignCode = 'INVALID@CODE';

    updateAdapterStub.withArgs({ campaignId, campaignCode }).throws({ errors: [{ code: 'CAMPAIGN_CODE_BAD_FORMAT' }] });

    // when
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
      notificationService.sendErrorNotification.calledOnceWithExactly({
        message: t('components.administration.update-campaign-code.notifications.error.campaign-code-format'),
      }),
    );
    assert.true(notificationService.sendSuccessNotification.notCalled);
  });

  test('should show error notification when campaign code is not unique', async function (assert) {
    // given
    const campaignId = '123';
    const campaignCode = 'EXISTING';

    updateAdapterStub.withArgs({ campaignId, campaignCode }).throws({ errors: [{ code: 'CAMPAIGN_CODE_NOT_UNIQUE' }] });

    // when
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
      notificationService.sendErrorNotification.calledOnceWithExactly({
        message: t('components.administration.update-campaign-code.notifications.error.unique-code-error'),
      }),
    );
    assert.true(notificationService.sendSuccessNotification.notCalled);
  });

  test('should show error notification when campaign ID is unknown', async function (assert) {
    // given
    const campaignId = '999';
    const campaignCode = 'XYZ';

    updateAdapterStub.withArgs({ campaignId, campaignCode }).throws({ errors: [{ code: 'UNKNOWN_CAMPAIGN_ID' }] });

    // when
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
      notificationService.sendErrorNotification.calledOnceWithExactly({
        message: t('components.administration.update-campaign-code.notifications.error.campaign-id-error'),
      }),
    );
    assert.true(notificationService.sendSuccessNotification.notCalled);
  });

  test('should show generic error notification for unknown errors', async function (assert) {
    // given
    const campaignId = '123';
    const campaignCode = 'XYZ';

    updateAdapterStub.withArgs({ campaignId, campaignCode }).throws({ errors: [{ code: 'UNKNOWN_ERROR' }] });

    // when
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
      notificationService.sendErrorNotification.calledOnceWithExactly({
        message: t('common.notifications.generic-error'),
      }),
    );
    assert.true(notificationService.sendSuccessNotification.notCalled);
  });
});
