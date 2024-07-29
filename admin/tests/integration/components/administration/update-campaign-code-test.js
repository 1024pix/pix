import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering.js';

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
    const screen = await render(hbs`<Administration::UpdateCampaignCode />`);

    await fillIn(
      screen.getByLabelText(this.intl.t('components.administration.update-campaign-code.form.campaignId')),
      campaignId,
    );
    await fillIn(
      screen.getByLabelText(this.intl.t('components.administration.update-campaign-code.form.campaignCode')),
      campaignCode,
    );

    await click(
      screen.getByRole('button', {
        name: this.intl.t('components.administration.update-campaign-code.form.button'),
      }),
    );

    // then
    assert.true(updateAdapterStub.calledOnce);
    assert.true(
      notificationService.success.calledOnceWithExactly(
        this.intl.t('components.administration.update-campaign-code.notifications.success'),
      ),
    );
    assert.true(notificationService.error.notCalled);
    assert.true(notificationService.clearAll.called);
  });
});
