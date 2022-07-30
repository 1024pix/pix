import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

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
      assert.expect(0);
      sinon.assert.called(route.session.invalidate);
    });

    test('should not invalidate session when a user is connected but not anonymous', async function (assert) {
      //given
      route.session.isAuthenticated = true;
      route.currentUser.user.isAnonymous = false;

      //when
      await route.beforeModel();

      //then
      assert.expect(0);
      sinon.assert.notCalled(route.session.invalidate);
    });
  });

  module('#model', function () {
    test('should load model', async function (assert) {
      //given/when
      await route.model();

      //then
      assert.expect(0);
      sinon.assert.calledWith(route.modelFor, 'campaigns');
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
      assert.expect(0);
      sinon.assert.calledWith(route.campaignStorage.clear, 'CODE');
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
        assert.expect(0);
        sinon.assert.notCalled(route.store.queryRecord);
      });

      test('should redirect to landing page', async function (assert) {
        //when
        await route.afterModel(campaign, transition);

        //then
        assert.expect(0);
        sinon.assert.calledWith(route.router.replaceWith, 'campaigns.campaign-landing-page');
      });

      module('archived campaign', function (hooks) {
        hooks.beforeEach(function () {
          campaign.isArchived = true;
        });

        test('should redirect to campaign archived error', async function (assert) {
          //when
          await route.afterModel(campaign, transition);

          //then
          assert.expect(0);
          sinon.assert.calledWith(route.router.replaceWith, 'campaigns.archived-error');
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
        assert.expect(0);
        sinon.assert.calledWith(route.store.queryRecord, 'campaignParticipation', {
          campaignId: 3,
          userId: 12,
        });
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
        assert.expect(0);
        sinon.assert.calledWith(route.router.replaceWith, 'campaigns.campaign-landing-page');
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
        assert.expect(0);
        sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entrance');
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
          assert.expect(0);
          sinon.assert.calledWith(route.router.replaceWith, 'campaigns.archived-error');
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
          assert.expect(0);
          sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entrance');
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
          assert.expect(0);
          sinon.assert.calledWith(route.campaignStorage.set, campaign.code, 'participantExternalId', 'externalId');
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
          assert.expect(0);
          sinon.assert.notCalled(route.campaignStorage.set);
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
          assert.expect(0);
          sinon.assert.calledWith(route.campaignStorage.set, campaign.code, 'retry', 'true');
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
          assert.expect(0);
          sinon.assert.notCalled(route.campaignStorage.set);
        });
      });
    });
  });
});
