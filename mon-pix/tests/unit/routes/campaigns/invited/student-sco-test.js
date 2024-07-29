import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | campaigns/invited/student-sco', function (hooks) {
  setupTest(hooks);

  module('#afterModel', function () {
    test('should redirect to campaigns.invited.fill-in-participant-external-id when an association already exists', async function (assert) {
      // given
      const route = this.owner.lookup('route:campaigns.invited.student-sco');
      const campaign = { code: 'campaignCode' };
      route.paramsFor = sinon.stub().returns(campaign);
      route.set(
        'store',
        Service.create({
          queryRecord: sinon.stub().resolves('a student user association'),
        }),
      );
      route.set(
        'currentUser',
        Service.create({
          user: { id: 'id' },
        }),
      );
      route.router = { replaceWith: sinon.stub() };

      // when
      await route.afterModel(campaign);

      // then
      sinon.assert.calledWith(
        route.router.replaceWith,
        'campaigns.invited.fill-in-participant-external-id',
        campaign.code,
      );
      assert.ok(true);
    });
  });
});
