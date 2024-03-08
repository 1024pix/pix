import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | update-campaign-code', function (hooks) {
  setupTest(hooks);

  let component, updateCampaignCodeStub, event, notificationStub, intlStub;

  hooks.beforeEach(function () {
    // given
    updateCampaignCodeStub = sinon.stub();
    notificationStub = { clearAll: sinon.stub(), success: sinon.stub(), error: sinon.stub() };
    intlStub = sinon.stub();
    component = createGlimmerComponent('component:administration/update-campaign-code');
    component.notifications = notificationStub;
    component.store.adapterFor = sinon.stub().returns({ updateCampaignCode: updateCampaignCodeStub });
    component.campaignId = 123;
    component.campaignCode = 'ABC';
    component.intl = { t: intlStub };
    event = {
      preventDefault: sinon.stub(),
    };
  });

  module('#updateCode', function () {
    module('when updateCampaignCode works', function () {
      test('it should call preventDefault', async function (assert) {
        // when
        await component.updateCode(event);

        // then
        assert.ok(event.preventDefault.calledOnce);
      });
      test('it should call updateCampaignCode', async function (assert) {
        // when
        await component.updateCode(event);

        // then
        assert.ok(updateCampaignCodeStub.calledOnce);
        assert.ok(updateCampaignCodeStub.calledWithExactly({ campaignId: 123, campaignCode: 'ABC' }));
      });
      test('it should call notification', async function (assert) {
        const successMsg = Symbol('successMsg');
        intlStub.returns(successMsg);
        // when
        await component.updateCode(event);

        // then
        assert.ok(notificationStub.clearAll.calledOnce);
        assert.ok(intlStub.calledWithExactly('components.administration.update-campaign-code.notifications.success'));
        assert.ok(notificationStub.success.calledWithExactly(successMsg));
      });
    });
    module('when updateCampaignCode returns a CAMPAIGN_CODE_BAD_FORMAT error', function (hooks) {
      hooks.beforeEach(function () {
        updateCampaignCodeStub.throws({ errors: [{ code: 'CAMPAIGN_CODE_BAD_FORMAT' }] });
      });
      test('it should call notification with bad format message', async function (assert) {
        const errorMsg = Symbol('errorMsg');
        intlStub.returns(errorMsg);
        // when
        await component.updateCode(event);

        // then
        assert.ok(notificationStub.clearAll.calledOnce);
        assert.ok(
          intlStub.calledWithExactly(
            'components.administration.update-campaign-code.notifications.error.campaign-code-format',
          ),
        );
        assert.ok(notificationStub.error.calledWithExactly(errorMsg));
      });
    });
    module('when updateCampaignCode returns a CAMPAIGN_CODE_NOT_UNIQUE error', function (hooks) {
      hooks.beforeEach(function () {
        updateCampaignCodeStub.throws({ errors: [{ code: 'CAMPAIGN_CODE_NOT_UNIQUE' }] });
      });
      test('it should call notification with bad format message', async function (assert) {
        const errorMsg = Symbol('errorMsg');
        intlStub.returns(errorMsg);
        // when
        await component.updateCode(event);

        // then
        assert.ok(notificationStub.clearAll.calledOnce);
        assert.ok(
          intlStub.calledWithExactly(
            'components.administration.update-campaign-code.notifications.error.unique-code-error',
          ),
        );
        assert.ok(notificationStub.error.calledWithExactly(errorMsg));
      });
    });
    module('when updateCampaignCode returns a UNKNOWN_CAMPAIGN_ID error', function (hooks) {
      hooks.beforeEach(function () {
        updateCampaignCodeStub.throws({ errors: [{ code: 'UNKNOWN_CAMPAIGN_ID' }] });
      });
      test('it should call notification with bad format message', async function (assert) {
        const errorMsg = Symbol('errorMsg');
        intlStub.returns(errorMsg);
        // when
        await component.updateCode(event);

        // then
        assert.ok(notificationStub.clearAll.calledOnce);
        assert.ok(
          intlStub.calledWithExactly(
            'components.administration.update-campaign-code.notifications.error.campaign-id-error',
          ),
        );
        assert.ok(notificationStub.error.calledWithExactly(errorMsg));
      });
    });
    module('when updateCampaignCode returns a generic error', function (hooks) {
      hooks.beforeEach(function () {
        updateCampaignCodeStub.throws({ errors: [{ code: 'unknown' }] });
      });
      test('it should call notification with bad format message', async function (assert) {
        const errorMsg = Symbol('errorMsg');
        intlStub.returns(errorMsg);
        // when
        await component.updateCode(event);

        // then
        assert.ok(notificationStub.clearAll.calledOnce);
        assert.ok(intlStub.calledWithExactly('common.notifications.generic-error'));
        assert.ok(notificationStub.error.calledWithExactly(errorMsg));
      });
    });
    module('when updateCampaignCode fails with no error', function (hooks) {
      hooks.beforeEach(function () {
        updateCampaignCodeStub.throws();
      });
      test('it should call notification with bad format message', async function (assert) {
        const errorMsg = Symbol('errorMsg');
        intlStub.returns(errorMsg);
        // when
        await component.updateCode(event);

        // then
        assert.ok(notificationStub.clearAll.calledOnce);
        assert.ok(intlStub.calledWithExactly('common.notifications.generic-error'));
        assert.ok(notificationStub.error.calledWithExactly(errorMsg));
      });
    });
  });
});
