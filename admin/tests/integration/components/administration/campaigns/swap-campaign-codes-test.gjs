import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import SwapCampaignCodes from 'pix-admin/components/administration/campaigns/swap-campaign-codes';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering.js';

module('Integration | Component | administration/swap-campaign-codes', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store, notificationService;

  hooks.beforeEach(function () {
    notificationService = this.owner.lookup('service:pixToast');
    store = this.owner.lookup('service:store');

    sinon.stub(notificationService, 'sendSuccessNotification');
    sinon.stub(notificationService, 'sendErrorNotification');
  });

  test('it should swap code', async function (assert) {
    // given
    const firstCampaignId = '18';
    const secondCampaignId = '20';

    const adapter = store.adapterFor('swap-campaign-code');
    const swapStub = sinon.stub(adapter, 'swap');

    swapStub.withArgs({ firstCampaignId, secondCampaignId }).resolves();

    //when
    const screen = await render(<template><SwapCampaignCodes /></template>);

    await fillIn(
      screen.getByLabelText(t('components.administration.swap-campaign-codes.form.firstCampaignId')),
      firstCampaignId,
    );
    await fillIn(
      screen.getByLabelText(t('components.administration.swap-campaign-codes.form.secondCampaignId')),
      secondCampaignId,
    );

    await click(
      screen.getByRole('button', {
        name: t('components.administration.swap-campaign-codes.form.button'),
      }),
    );

    // then
    assert.true(swapStub.calledOnce);
    assert.true(
      notificationService.sendSuccessNotification.calledOnceWithExactly({
        message: t('components.administration.swap-campaign-codes.notifications.success'),
      }),
    );
    assert.true(notificationService.sendErrorNotification.notCalled);
  });

  test('it should display common error notification', async function (assert) {
    // given
    const firstCampaignId = '18';
    const secondCampaignId = '20';

    const adapter = store.adapterFor('swap-campaign-code');
    const swapStub = sinon.stub(adapter, 'swap');

    swapStub.withArgs({ firstCampaignId, secondCampaignId }).throws();

    //when
    const screen = await render(<template><SwapCampaignCodes /></template>);

    await fillIn(
      screen.getByLabelText(t('components.administration.swap-campaign-codes.form.firstCampaignId')),
      firstCampaignId,
    );
    await fillIn(
      screen.getByLabelText(t('components.administration.swap-campaign-codes.form.secondCampaignId')),
      secondCampaignId,
    );

    await click(
      screen.getByRole('button', {
        name: t('components.administration.swap-campaign-codes.form.button'),
      }),
    );

    // then
    assert.true(swapStub.calledOnce);
    assert.true(notificationService.sendSuccessNotification.notCalled);
    assert.true(
      notificationService.sendErrorNotification.calledOnceWithExactly({
        message: t('common.notifications.generic-error'),
      }),
    );
  });

  test('it should display mismatch organization error notification', async function (assert) {
    // given
    const firstCampaignId = '18';
    const secondCampaignId = '20';

    const adapter = store.adapterFor('swap-campaign-code');
    const swapStub = sinon.stub(adapter, 'swap');

    swapStub.withArgs({ firstCampaignId, secondCampaignId }).throws({ errors: [{ code: 'ORGANIZATION_MISMATCH' }] });

    //when
    const screen = await render(<template><SwapCampaignCodes /></template>);

    await fillIn(
      screen.getByLabelText(t('components.administration.swap-campaign-codes.form.firstCampaignId')),
      firstCampaignId,
    );
    await fillIn(
      screen.getByLabelText(t('components.administration.swap-campaign-codes.form.secondCampaignId')),
      secondCampaignId,
    );

    await click(
      screen.getByRole('button', {
        name: t('components.administration.swap-campaign-codes.form.button'),
      }),
    );

    // then
    assert.true(swapStub.calledOnce);
    assert.true(notificationService.sendSuccessNotification.notCalled);
    assert.true(
      notificationService.sendErrorNotification.calledOnceWithExactly({
        message: t('components.administration.swap-campaign-codes.notifications.error.mismatch-organization'),
      }),
    );
  });

  test('it should display swap code error notification', async function (assert) {
    // given
    const firstCampaignId = '18';
    const secondCampaignId = '20';

    const adapter = store.adapterFor('swap-campaign-code');
    const swapStub = sinon.stub(adapter, 'swap');

    swapStub.withArgs({ firstCampaignId, secondCampaignId }).throws({ errors: [{ code: 'UNKNOWN_CAMPAIGN_ID' }] });

    //when
    const screen = await render(<template><SwapCampaignCodes /></template>);

    await fillIn(
      screen.getByLabelText(t('components.administration.swap-campaign-codes.form.firstCampaignId')),
      firstCampaignId,
    );
    await fillIn(
      screen.getByLabelText(t('components.administration.swap-campaign-codes.form.secondCampaignId')),
      secondCampaignId,
    );

    await click(
      screen.getByRole('button', {
        name: t('components.administration.swap-campaign-codes.form.button'),
      }),
    );

    // then
    assert.true(swapStub.calledOnce);
    assert.true(notificationService.sendSuccessNotification.notCalled);
    assert.true(
      notificationService.sendErrorNotification.calledOnceWithExactly({
        message: t('components.administration.swap-campaign-codes.notifications.error.swap-code-error'),
      }),
    );
  });
});
