import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | Campaign | Assessment | Skill review', function (hooks) {
  setupTest(hooks);

  let route;
  const campaign = { id: 123456, code: 'NEW_CODE' };
  const user = { id: 567890 };
  const storeStub = {
    queryRecord: sinon.stub(),
  };
  const currentUserStub = { user };

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:campaigns.assessment.skill-review');
    route.modelFor = sinon.stub().returns(campaign);
    route.router = { transitionTo: sinon.stub() };
    route.store = storeStub;
    route.currentUser = currentUserStub;
  });

  module('#model', function () {
    module('when no participation', function (hooks) {
      hooks.beforeEach(function () {
        storeStub.queryRecord.rejects({ errors: [{ status: '412' }] });
      });
      test('should redirect to start or resume', async function (assert) {
        await route.model();

        assert.expect(0);
        sinon.assert.calledWith(route.router.transitionTo, 'campaigns.entry-point', 'NEW_CODE');
      });
    });

    module('when participation exists', function (hooks) {
      hooks.beforeEach(function () {
        storeStub.queryRecord
          .withArgs('campaignParticipationResult', { campaignId: campaign.id, userId: user.id })
          .resolves(campaign);
      });

      test('should not redirect', async function (assert) {
        await route.model();

        assert.expect(0);
        sinon.assert.notCalled(route.router.transitionTo);
      });
    });
  });
});
