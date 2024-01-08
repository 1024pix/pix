import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { click, fillIn } from '@ember/test-helpers';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering.js';

module('Integration | Component |  administration/swap-campaign-codes', function (hooks) {
  setupIntlRenderingTest(hooks);

  let store, notificationService;

  hooks.beforeEach(function () {
    notificationService = this.owner.lookup('service:notifications');
    store = this.owner.lookup('service:store');

    sinon.stub(notificationService, 'success');
    sinon.stub(notificationService, 'clearAll');
    sinon.stub(notificationService, 'error');
  });

  test('it should swap code', async function (assert) {
    // given
    const firstCampaignId = '18';
    const secondCampaignId = '20';

    const adapter = store.adapterFor('swap-campaign-code');
    const swapStub = sinon.stub(adapter, 'swap');

    swapStub.withArgs({ firstCampaignId, secondCampaignId }).resolves();

    //when
    const screen = await render(hbs`<Administration::SwapCampaignCodes />`);

    await fillIn(
      screen.getByLabelText(this.intl.t('components.administration.swap-campaign-codes.form.firstCampaignId')),
      firstCampaignId,
    );
    await fillIn(
      screen.getByLabelText(this.intl.t('components.administration.swap-campaign-codes.form.secondCampaignId')),
      secondCampaignId,
    );

    await click(
      screen.getByRole('button', {
        name: this.intl.t('components.administration.swap-campaign-codes.form.button'),
      }),
    );

    // then
    assert.true(swapStub.calledOnce);
    assert.true(
      notificationService.success.calledOnceWithExactly(
        this.intl.t('components.administration.swap-campaign-codes.notifications.success'),
      ),
    );
    assert.true(notificationService.error.notCalled);
    assert.true(notificationService.clearAll.called);
  });

  test('it should display common error notification', async function (assert) {
    // given
    const firstCampaignId = '18';
    const secondCampaignId = '20';

    const adapter = store.adapterFor('swap-campaign-code');
    const swapStub = sinon.stub(adapter, 'swap');

    swapStub.withArgs({ firstCampaignId, secondCampaignId }).throws();

    //when
    const screen = await render(hbs`<Administration::SwapCampaignCodes />`);

    await fillIn(
      screen.getByLabelText(this.intl.t('components.administration.swap-campaign-codes.form.firstCampaignId')),
      firstCampaignId,
    );
    await fillIn(
      screen.getByLabelText(this.intl.t('components.administration.swap-campaign-codes.form.secondCampaignId')),
      secondCampaignId,
    );

    await click(
      screen.getByRole('button', {
        name: this.intl.t('components.administration.swap-campaign-codes.form.button'),
      }),
    );

    // then
    assert.true(swapStub.calledOnce);
    assert.true(notificationService.clearAll.called);
    assert.true(notificationService.success.notCalled);
    assert.true(notificationService.error.calledOnceWithExactly(this.intl.t('common.notifications.generic-error')));
  });

  test('it should display mismatch organization error notification', async function (assert) {
    // given
    const firstCampaignId = '18';
    const secondCampaignId = '20';

    const adapter = store.adapterFor('swap-campaign-code');
    const swapStub = sinon.stub(adapter, 'swap');

    swapStub.withArgs({ firstCampaignId, secondCampaignId }).throws({ errors: [{ code: 'ORGANIZATION_MISMATCH' }] });

    //when
    const screen = await render(hbs`<Administration::SwapCampaignCodes />`);

    await fillIn(
      screen.getByLabelText(this.intl.t('components.administration.swap-campaign-codes.form.firstCampaignId')),
      firstCampaignId,
    );
    await fillIn(
      screen.getByLabelText(this.intl.t('components.administration.swap-campaign-codes.form.secondCampaignId')),
      secondCampaignId,
    );

    await click(
      screen.getByRole('button', {
        name: this.intl.t('components.administration.swap-campaign-codes.form.button'),
      }),
    );

    // then
    assert.true(swapStub.calledOnce);
    assert.true(notificationService.clearAll.called);
    assert.true(notificationService.success.notCalled);
    assert.true(
      notificationService.error.calledOnceWithExactly(
        this.intl.t('components.administration.swap-campaign-codes.notifications.error.mismatch-organization'),
      ),
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
    const screen = await render(hbs`<Administration::SwapCampaignCodes />`);

    await fillIn(
      screen.getByLabelText(this.intl.t('components.administration.swap-campaign-codes.form.firstCampaignId')),
      firstCampaignId,
    );
    await fillIn(
      screen.getByLabelText(this.intl.t('components.administration.swap-campaign-codes.form.secondCampaignId')),
      secondCampaignId,
    );

    await click(
      screen.getByRole('button', {
        name: this.intl.t('components.administration.swap-campaign-codes.form.button'),
      }),
    );

    // then
    assert.true(swapStub.calledOnce);
    assert.true(notificationService.clearAll.called);
    assert.true(notificationService.success.notCalled);
    assert.true(
      notificationService.error.calledOnceWithExactly(
        this.intl.t('components.administration.swap-campaign-codes.notifications.error.swap-code-error'),
      ),
    );
  });
});
