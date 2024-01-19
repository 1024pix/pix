import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import ENV from 'mon-pix/config/environment';

module('Unit | Route | Entry Point', function (hooks) {
  setupTest(hooks);

  let route, campaign;

  hooks.beforeEach(function () {
    campaign = EmberObject.create({
      id: 3,
      code: 'NEW_CODE',
    });
    route = this.owner.lookup('route:campaigns.entry-point');

    route.store = { queryRecord: sinon.stub() };
    route.router = { replaceWith: sinon.stub() };
    route.modelFor = sinon.stub();
    route.campaignStorage = { set: sinon.stub(), clear: sinon.stub() };
    route.session = { isAuthenticated: false, invalidate: sinon.stub() };
    route.currentUser = { user: {} };
  });

  module('#beforeModel', function () {
    test('should invalidate session when a user is connected and anonymous', async function (assert) {
      //given
      route.session.isAuthenticated = true;
      route.currentUser.user.isAnonymous = true;

      //when
      await route.beforeModel();

      //then
      sinon.assert.called(route.session.invalidate);
      assert.ok(true);
    });

    test('should not invalidate session when a user is connected but not anonymous', async function (assert) {
      //given
      route.session.isAuthenticated = true;
      route.currentUser.user.isAnonymous = false;

      //when
      await route.beforeModel();

      //then
      sinon.assert.notCalled(route.session.invalidate);
      assert.ok(true);
    });
  });

  module('#model', function () {
    test('should load model', async function (assert) {
      //given/when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'campaigns');
      assert.ok(true);
    });
  });

  module('#afterModel', function (hooks) {
    let transition;
    hooks.beforeEach(function () {
      transition = { to: { queryParams: {} } };
    });

    test('should erase campaign storage', async function (assert) {
      //given/when
      await route.afterModel({ code: 'CODE' }, transition);

      //then
      sinon.assert.calledWith(route.campaignStorage.clear, 'CODE');
      assert.ok(true);
    });

    module('user not connected', function (hooks) {
      hooks.beforeEach(function () {
        route.session.isAuthenticated = false;
        route.currentUser = undefined;
      });

      test('should not call queryRecord to retrieve campaignParticipation', async function (assert) {
        //when
        await route.afterModel(campaign, transition);

        //then
        sinon.assert.notCalled(route.store.queryRecord);
        assert.ok(true);
      });

      test('should redirect to landing page', async function (assert) {
        //when
        await route.afterModel(campaign, transition);

        //then
        sinon.assert.calledWith(route.router.replaceWith, 'campaigns.campaign-landing-page');
        assert.ok(true);
      });

      module('archived campaign', function (hooks) {
        hooks.beforeEach(function () {
          campaign.isArchived = true;
        });

        test('should redirect to campaign archived error', async function (assert) {
          //when
          await route.afterModel(campaign, transition);

          //then
          sinon.assert.calledWith(route.router.replaceWith, 'campaigns.archived-error');
          assert.ok(true);
        });
      });
    });

    module('user connected', function (hooks) {
      hooks.beforeEach(function () {
        route.currentUser = { user: { id: 12 } };
        route.session.isAuthenticated = true;
      });

      test('should call queryRecord to retrieve campaignParticipation', async function (assert) {
        //when
        await route.afterModel(campaign, transition);

        //then
        sinon.assert.calledWith(route.store.queryRecord, 'campaignParticipation', {
          campaignId: 3,
          userId: 12,
        });
        assert.ok(true);
      });

      test('should redirect to landing page when no ongoing campaign participation', async function (assert) {
        //given
        route.store.queryRecord
          .withArgs('campaignParticipation', {
            campaignId: 3,
            userId: 12,
          })
          .resolves(null);

        //when
        await route.afterModel(campaign, transition);

        //then
        sinon.assert.calledWith(route.router.replaceWith, 'campaigns.campaign-landing-page');
        assert.ok(true);
      });

      test('should redirect to landing page when campaign is linked to autonomous course organization', async function (assert) {
        //given
        route.store.queryRecord
          .withArgs('campaignParticipation', {
            campaignId: 3,
            userId: 12,
            organizationId: ENV.APP.AUTONOMOUS_COURSES_ORGANIZATION_ID,
          })
          .resolves('Existing campaign participation');

        //when
        await route.afterModel(campaign, transition);

        //then
        sinon.assert.calledWith(route.router.replaceWith, 'campaigns.campaign-landing-page');
        assert.ok(true);
      });

      test('should redirect to entrance when ongoing campaign participation is existing', async function (assert) {
        //given
        route.store.queryRecord
          .withArgs('campaignParticipation', {
            campaignId: 3,
            userId: 12,
          })
          .resolves('Ma Participation');

        //when
        await route.afterModel(campaign, transition);

        //then
        sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entrance');
        assert.ok(true);
      });

      module('archived campaign', function (hooks) {
        hooks.beforeEach(function () {
          campaign.isArchived = true;
        });

        test('should redirect to campaign archived error with no participation', async function (assert) {
          //given
          route.store.queryRecord
            .withArgs('campaignParticipation', {
              campaignId: 3,
              userId: 12,
            })
            .resolves(null);

          //when
          await route.afterModel(campaign, transition);

          //then
          sinon.assert.calledWith(route.router.replaceWith, 'campaigns.archived-error');
          assert.ok(true);
        });

        test('should redirect to entrance with participation', async function (assert) {
          //given
          route.store.queryRecord
            .withArgs('campaignParticipation', {
              campaignId: 3,
              userId: 12,
            })
            .resolves('Ma Participation');

          //when
          await route.afterModel(campaign, transition);

          //then
          sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entrance');
          assert.ok(true);
        });
      });
    });

    module('participantExternalId', function () {
      module('when there are participantExternalId', function () {
        test('sets the current participantExternalId', async function (assert) {
          //given
          transition = { to: { queryParams: { participantExternalId: 'externalId' } } };
          route.currentUser = {
            user: {
              id: 12,
            },
          };

          //when
          await route.afterModel(campaign, transition);

          //then
          sinon.assert.calledWith(route.campaignStorage.set, campaign.code, 'participantExternalId', 'externalId');
          assert.ok(true);
        });

        test('allow externalId as alias', async function (assert) {
          //given
          transition = { to: { queryParams: { externalId: 'externalId' } } };
          route.currentUser = {
            user: {
              id: 12,
            },
          };

          //when
          await route.afterModel(campaign, transition);

          //then
          sinon.assert.calledWith(route.campaignStorage.set, campaign.code, 'participantExternalId', 'externalId');
          assert.ok(true);
        });
      });

      module('when there is no participantExternalId', function () {
        test('does not set the participantExternalId', async function (assert) {
          //given
          const transition = { to: { queryParams: {} } };
          route.currentUser = {
            user: {
              id: 12,
            },
          };

          //when
          await route.afterModel(campaign, transition);

          //then
          sinon.assert.notCalled(route.campaignStorage.set);
          assert.ok(true);
        });
      });
    });

    module('retry', function () {
      module('when there are retry', function () {
        test('sets the current retry', async function (assert) {
          //given
          const transition = { to: { queryParams: { retry: 'true' } } };
          route.currentUser = {
            user: {
              id: 12,
            },
          };

          //when
          await route.afterModel(campaign, transition);

          //then
          sinon.assert.calledWith(route.campaignStorage.set, campaign.code, 'retry', 'true');
          assert.ok(true);
        });
      });

      module('when there is no retry', function () {
        test('does not set the retry', async function (assert) {
          //given
          const transition = { to: { queryParams: {} } };
          route.currentUser = {
            user: {
              id: 12,
            },
          };

          //when
          await route.afterModel(campaign, transition);

          //then
          sinon.assert.notCalled(route.campaignStorage.set);
          assert.ok(true);
        });
      });
    });
  });
});
