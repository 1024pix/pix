import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubCurrentUserService } from '../../../helpers/service-stubs';

module('Unit | Route | ExistingParticipation', function (hooks) {
  setupTest(hooks);

  let route, sessionStub;

  hooks.beforeEach(function () {
    sessionStub = {
      requireAuthenticationAndApprovedTermsOfService: sinon.stub(),
    };
    stubCurrentUserService(this.owner, { id: '124', firstName: 'Alain', isAnonymous: false });
    route = this.owner.lookup('route:campaigns.existing-participation');
    route.set('session', sessionStub);

    route.paramsFor = sinon.stub();
    route.store = { queryRecord: sinon.stub() };
  });

  module('#beforeModel', function () {
    test('should call session requireAuthenticationAndApprovedTermsOfService with transition', async function (assert) {
      //given
      const transition = Symbol('transition');
      //when
      await route.beforeModel(transition);

      //then
      assert.ok(sessionStub.requireAuthenticationAndApprovedTermsOfService.calledWithExactly(transition));
    });
  });

  module('#model', function () {
    test('should return organization learner identity', async function (assert) {
      //given
      const campaignCode = Symbol('campaignCode');
      const organizationToJoin = {
        id: Symbol('organizationId'),
      };
      const organizationLearnerIdentity = Symbol('organizationLearnerIdentity');

      route.paramsFor.withArgs('campaigns').returns({ code: campaignCode });
      route.store.queryRecord.withArgs('organization-to-join', { code: campaignCode }).resolves(organizationToJoin);
      route.store.queryRecord
        .withArgs('organization-learner-identity', { organizationId: organizationToJoin.id, userId: '124' })
        .resolves(organizationLearnerIdentity);
      //when

      const result = await route.model();

      //then
      assert.strictEqual(result, organizationLearnerIdentity);
    });
  });
});
