import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | campaigns/invited/student-sup', function (hooks) {
  setupTest(hooks);

  module('#afterModel', function () {
    test('for campaigns, should redirect to campaigns.fill-in-participant-external-id when an association already exists', async function (assert) {
      // given
      const route = this.owner.lookup('route:organizations.invited.student-sup');
      const campaign = { code: 'campaignCode', organizationId: 1 };
      const verifiedCode = { id: campaign.code, type: 'campaign', campaign };
      const organizationToJoin = { id: 1 };
      route.paramsFor = sinon.stub().returns(campaign);
      const user = { id: 'id' };
      const queryRecordStub = sinon.stub();
      route.set(
        'store',
        Service.create({
          queryRecord: queryRecordStub.resolves('a student association'),
        }),
      );
      route.set(
        'currentUser',
        Service.create({
          user,
        }),
      );
      route.router = { transitionTo: sinon.stub() };

      // when
      await route.afterModel({ verifiedCode, organizationToJoin });

      // then
      sinon.assert.calledWith(queryRecordStub, 'organization-learner-identity', {
        organizationId: organizationToJoin.id,
        userId: user.id,
      });

      sinon.assert.calledWith(route.router.transitionTo, 'campaigns.fill-in-participant-external-id', campaign.code);
      assert.ok(true);
    });
    test('for combined courses, should redirect to campaigns.fill-in-participant-external-id when an association already exists', async function (assert) {
      // given
      const route = this.owner.lookup('route:organizations.invited.student-sup');
      const combinedCourse = { code: 'combinedCourseCode', organizationId: 1 };
      const verifiedCode = { id: combinedCourse.code, type: 'combined-courses', combinedCourse };
      const organizationToJoin = { id: 1 };
      route.paramsFor = sinon.stub().returns(combinedCourse);
      const user = { id: 'id' };
      const queryRecordStub = sinon.stub();
      route.set(
        'store',
        Service.create({
          queryRecord: queryRecordStub.resolves('a student association'),
        }),
      );
      route.set(
        'currentUser',
        Service.create({
          user,
        }),
      );
      route.router = { transitionTo: sinon.stub() };

      // when
      await route.afterModel({ verifiedCode, organizationToJoin });

      // then
      sinon.assert.calledWith(queryRecordStub, 'organization-learner-identity', {
        organizationId: organizationToJoin.id,
        userId: user.id,
      });

      sinon.assert.calledWith(route.router.transitionTo, 'combined-courses.programme', verifiedCode.id);
      assert.ok(true);
    });
  });
});
