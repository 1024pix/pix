import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Invited', function (hooks) {
  setupTest(hooks);

  let route, campaign, organizationToJoin;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:organizations.invited');
    route.modelFor = sinon.stub();
    route.router = { replaceWith: sinon.stub(), transitionTo: sinon.stub() };
    route.accessStorage = { isAssociationDone: sinon.stub() };
    route.session.requireAuthenticationAndApprovedTermsOfService = sinon.stub();
  });

  module('#model', function () {
    test('should load model', async function (assert) {
      //when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'organizations');
      assert.ok(true);
    });
  });

  module('#afterModel', function () {
    module('when reconciliation is required by organization', function (hooks) {
      hooks.beforeEach(function () {
        organizationToJoin = EmberObject.create({ id: 1, isReconciliationRequired: true });
      });

      module('when trying to access a campaign', function () {
        test('should redirect to reconciliation invited page when association is needed', async function (assert) {
          //given
          campaign = EmberObject.create({ organizationId: 1 });
          const verifiedCode = EmberObject.create({ id: campaign.code, type: 'campaign', campaign });

          route.accessStorage.isAssociationDone.withArgs(organizationToJoin.id).returns(false);

          //when
          await route.afterModel({ verifiedCode, organizationToJoin });

          //then
          const expectedResult = route.router.replaceWith.calledWithExactly(
            'organizations.invited.reconciliation',
            campaign.code,
          );
          assert.true(expectedResult);
        });
        test('should redirect to fill in participant external page when association is already done', async function (assert) {
          //given
          campaign = EmberObject.create({ organizationId: 1 });
          organizationToJoin = EmberObject.create({ id: 1, isReconciliationRequired: true });
          const verifiedCode = EmberObject.create({ id: campaign.code, type: 'campaign', campaign });

          route.accessStorage.isAssociationDone.withArgs(campaign.organizationId).returns(true);

          //when
          await route.afterModel({ verifiedCode, organizationToJoin });

          //then
          const expectedResult = route.router.replaceWith.calledWithExactly(
            'campaigns.fill-in-participant-external-id',
            verifiedCode.id,
          );
          assert.true(expectedResult);
        });
      });

      module('when trying to access a combined course', function () {
        test('should redirect to reconciliation invited page when association is needed', async function (assert) {
          //given
          const combinedCourse = EmberObject.create({ organizationId: 1, code: 'COMBINIX1' });
          const verifiedCode = EmberObject.create({ id: combinedCourse.code, type: 'combined-course', combinedCourse });

          route.accessStorage.isAssociationDone.withArgs(organizationToJoin.id).returns(false);

          //when
          await route.afterModel({ verifiedCode, organizationToJoin });

          //then
          const expectedResult = route.router.replaceWith.calledWithExactly(
            'organizations.invited.reconciliation',
            combinedCourse.code,
          );
          assert.true(expectedResult);
        });

        test('for combined courses, it should redirect to combined course page when association is already done', async function (assert) {
          //given
          const combinedCourse = EmberObject.create({ organizationId: 1, code: 'COMBINIX1' });
          organizationToJoin = EmberObject.create({ id: 1, isReconciliationRequired: true });
          const verifiedCode = EmberObject.create({ id: combinedCourse.code, type: 'combined-course' });

          route.accessStorage.isAssociationDone.withArgs(combinedCourse.organizationId).returns(true);

          //when
          await route.afterModel({ verifiedCode, organizationToJoin });

          //then
          const expectedResult = route.router.replaceWith.calledWithExactly(
            'combined-courses.programme',
            verifiedCode.id,
          );
          assert.true(expectedResult);
        });
      });
    });
    module('student sco', function () {
      test('should redirect student sco invited page when association is needed', async function (assert) {
        //given
        campaign = EmberObject.create({ organizationId: 1 });
        organizationToJoin = EmberObject.create({ id: 1, isRestricted: true, type: 'SCO' });
        const verifiedCode = EmberObject.create({ id: campaign.code, type: 'campaign', campaign });

        route.accessStorage.isAssociationDone.withArgs(organizationToJoin.id).returns(false);

        //when
        await route.afterModel({ verifiedCode, organizationToJoin });

        //then
        const expectedResult = route.router.replaceWith.calledWithExactly(
          'organizations.invited.student-sco',
          campaign.code,
        );
        assert.true(expectedResult);
      });

      test('should redirect to fill in participant external page when association is already done', async function (assert) {
        //given
        campaign = EmberObject.create({ organizationId: 1 });
        organizationToJoin = EmberObject.create({ id: 1, isRestricted: true, type: 'SCO' });
        const verifiedCode = EmberObject.create({ id: campaign.code, type: 'campaign', campaign });

        route.accessStorage.isAssociationDone.withArgs(organizationToJoin.id).returns(true);

        //when
        await route.afterModel({ verifiedCode, organizationToJoin });

        //then
        const expectedResult = route.router.replaceWith.calledWithExactly(
          'campaigns.fill-in-participant-external-id',
          campaign.code,
        );
        assert.true(expectedResult);
      });
    });

    module('student sup', function () {
      test('should redirect student sup invited page when association is needed', async function (assert) {
        //given
        campaign = EmberObject.create({ organizationId: 1 });
        organizationToJoin = EmberObject.create({ id: 1, isRestricted: true, type: 'SUP' });
        const verifiedCode = EmberObject.create({ id: campaign.code, type: 'campaign', campaign });
        route.accessStorage.isAssociationDone.withArgs(organizationToJoin.id).returns(false);

        //when
        await route.afterModel({ verifiedCode, organizationToJoin });

        //then
        const expectedResult = route.router.replaceWith.calledWithExactly(
          'organizations.invited.student-sup',
          campaign.code,
        );
        assert.true(expectedResult);
      });

      test('for campaigns, should redirect to fill in participant external page when association is already done', async function (assert) {
        //given
        campaign = EmberObject.create({ organizationId: 1, code: 'CAMPAIGN1' });
        organizationToJoin = EmberObject.create({ id: 1, isRestricted: true, type: 'SUP' });
        const verifiedCode = EmberObject.create({ id: campaign.code, type: 'campaign', campaign });
        route.accessStorage.isAssociationDone.withArgs(campaign.organizationId).returns(true);

        //when
        await route.afterModel({ verifiedCode, organizationToJoin });

        //then
        const expectedResult = route.router.replaceWith.calledWithExactly(
          'campaigns.fill-in-participant-external-id',
          verifiedCode.id,
        );
        assert.true(expectedResult);
      });
      test('for combined courses, should redirect to fill in participant external page when association is already done', async function (assert) {
        //given
        EmberObject.create({ organizationId: 1, code: 'COMBINIX1' });
        organizationToJoin = EmberObject.create({ id: 1, isRestricted: true, type: 'SUP' });
        const combinedCourse = EmberObject.create({ organizationId: 1, code: 'COMBINIX1' });
        route.accessStorage.isAssociationDone.withArgs(combinedCourse.organizationId).returns(true);
        const verifiedCode = EmberObject.create({ id: combinedCourse.code, type: 'combined-course' });

        //when
        await route.afterModel({ verifiedCode, organizationToJoin });

        //then
        const expectedResult = route.router.replaceWith.calledWithExactly(
          'combined-courses.programme',
          verifiedCode.id,
        );
        assert.true(expectedResult);
      });
    });

    test('should redirect to fill in participant external otherwise', async function (assert) {
      //given
      campaign = EmberObject.create({ organizationId: 1 });
      route.accessStorage.isAssociationDone.withArgs(campaign.organizationId).returns(false);
      const verifiedCode = EmberObject.create({ id: campaign.code, type: 'campaign', campaign });
      organizationToJoin = EmberObject.create({ id: 1, isRestricted: false });

      //when
      await route.afterModel({ verifiedCode, organizationToJoin });

      //then
      sinon.assert.calledWith(route.router.replaceWith, 'campaigns.fill-in-participant-external-id', campaign.code);
      assert.ok(true);
    });
  });
});
