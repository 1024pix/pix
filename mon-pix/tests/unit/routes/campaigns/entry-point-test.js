import EmberObject from '@ember/object';
import { setupTest } from 'ember-qunit';
import ENV from 'mon-pix/config/environment';
import Location from 'mon-pix/utils/location';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Entry Point', function (hooks) {
  setupTest(hooks);

  let route, campaign;

  hooks.beforeEach(function () {
    campaign = EmberObject.create({
      id: '3',
      code: 'NEW_CODE',
      isAccessible: true,
    });
    route = this.owner.lookup('route:campaigns.entry-point');

    route.store = { queryRecord: sinon.stub() };
    route.router = { replaceWith: sinon.stub() };
    route.modelFor = sinon.stub();
    route.campaignStorage = { set: sinon.stub(), clear: sinon.stub() };
    route.accessStorage = { clear: sinon.stub() };
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

    test('should erase campaign and access storage', async function (assert) {
      //given/when
      await route.afterModel({ code: 'CODE', organizationId: 1 }, transition);

      //then
      sinon.assert.calledWith(route.campaignStorage.clear, 'CODE');
      sinon.assert.calledWith(route.accessStorage.clear, 1);
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

      module('non acessible campaign', function (hooks) {
        hooks.beforeEach(function () {
          campaign.isAccessible = false;
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
        route.currentUser = { user: { id: '12' } };
        route.session.isAuthenticated = true;
      });

      test('should call queryRecord to retrieve campaignParticipation', async function (assert) {
        //when
        await route.afterModel(campaign, transition);

        //then
        sinon.assert.calledWith(route.store.queryRecord, 'campaign-participation', {
          campaignId: '3',
          userId: '12',
        });
        assert.ok(true);
      });

      test('should redirect to landing page when no ongoing campaign participation', async function (assert) {
        //given
        route.store.queryRecord
          .withArgs('campaign-participation', {
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
          .withArgs('campaign-participation', {
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
          .withArgs('campaign-participation', {
            campaignId: '3',
            userId: '12',
          })
          .resolves('Ma Participation');

        //when
        await route.afterModel(campaign, transition);

        //then
        sinon.assert.calledWith(route.router.replaceWith, 'campaigns.entrance');
        assert.ok(true);
      });

      module('non accessible campaign', function (hooks) {
        hooks.beforeEach(function () {
          campaign.isAccessible = false;
        });

        test('should redirect to campaign archived error with no participation', async function (assert) {
          //given
          route.store.queryRecord
            .withArgs('campaign-participation', {
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
            .withArgs('campaign-participation', {
              campaignId: '3',
              userId: '12',
            })
            .resolves('Ma Participation');

          //when
          await route.afterModel(campaign, transition);

          //then
          sinon.assert.calledWith(route.router.replaceWith, 'campaigns.archived-error');
          assert.ok(true);
        });
      });
    });

    module('campaign is part of a combined course', function (hooks) {
      hooks.beforeEach(function () {
        campaign.isPartOfCombinedCourse = true;
        campaign.combinedCourseCode = 'COMBINIX1';
      });

      module('user not connected', function (hooks) {
        hooks.beforeEach(function () {
          route.session.isAuthenticated = false;
          route.currentUser = undefined;
        });

        test('should redirect to combined course entry point when accessing campaign directly', async function (assert) {
          //when
          await route.afterModel(campaign, transition);

          //then
          sinon.assert.calledOnceWithExactly(
            route.router.replaceWith,
            'combined-courses.combined-course.entry-point',
            'COMBINIX1',
          );
          assert.ok(true);
        });

        test('should redirect to campaign archived error when campaign is not accessible', async function (assert) {
          //given
          campaign.isAccessible = false;

          //when
          await route.afterModel(campaign, transition);

          //then
          sinon.assert.calledOnceWithExactly(route.router.replaceWith, 'campaigns.archived-error', 'NEW_CODE');
          assert.ok(true);
        });
      });

      module('user connected', function (hooks) {
        hooks.beforeEach(function () {
          route.currentUser = { user: { id: '12' } };
          route.session.isAuthenticated = true;
        });

        module('when user has not participated yet', function (hooks) {
          hooks.beforeEach(function () {
            route.store.queryRecord
              .withArgs('campaign-participation', { campaignId: '3', userId: '12' })
              .resolves(null);
          });

          test('should redirect to combined course entry point when accessing campaign directly', async function (assert) {
            //when
            await route.afterModel(campaign, transition);

            //then
            sinon.assert.calledOnceWithExactly(
              route.router.replaceWith,
              'combined-courses.combined-course.entry-point',
              'COMBINIX1',
            );
            assert.ok(true);
          });

          test('should redirect to combined course entry point when coming from a route outside the combined course', async function (assert) {
            //given
            transition.from = { name: 'fill-in-campaign-code' };

            //when
            await route.afterModel(campaign, transition);

            //then
            sinon.assert.calledOnceWithExactly(
              route.router.replaceWith,
              'combined-courses.combined-course.entry-point',
              'COMBINIX1',
            );
            assert.ok(true);
          });

          ['combined-courses.combined-course.presentation', 'combined-courses.combined-course.tunnel'].forEach(
            (fromRouteName) => {
              test(`should redirect to organization access, skipping campaign landing page, when coming from ${fromRouteName}`, async function (assert) {
                //given
                transition.from = { name: fromRouteName };

                //when
                await route.afterModel(campaign, transition);

                //then
                sinon.assert.calledOnceWithExactly(route.router.replaceWith, 'organizations.access', 'NEW_CODE');
                assert.ok(true);
              });
            },
          );

          test('should redirect to organization access when combined course code cannot be found', async function (assert) {
            //given
            campaign.combinedCourseCode = null;

            //when
            await route.afterModel(campaign, transition);

            //then
            sinon.assert.calledOnceWithExactly(route.router.replaceWith, 'organizations.access', 'NEW_CODE');
            assert.ok(true);
          });
        });

        module('when user has already participated', function (hooks) {
          hooks.beforeEach(function () {
            route.store.queryRecord
              .withArgs('campaign-participation', { campaignId: '3', userId: '12' })
              .resolves('Ma Participation');
          });

          test('should redirect to entrance when accessing campaign directly', async function (assert) {
            //when
            await route.afterModel(campaign, transition);

            //then
            sinon.assert.calledOnceWithExactly(route.router.replaceWith, 'campaigns.entrance', 'NEW_CODE');
            assert.ok(true);
          });

          test('should redirect to entrance when coming from the combined course', async function (assert) {
            //given
            transition.from = { name: 'combined-courses.combined-course.presentation' };

            //when
            await route.afterModel(campaign, transition);

            //then
            sinon.assert.calledOnceWithExactly(route.router.replaceWith, 'campaigns.entrance', 'NEW_CODE');
            assert.ok(true);
          });
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
              id: '12',
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
              id: '12',
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
              id: '12',
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
              id: '12',
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
              id: '12',
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

    module('FWB campaign redirection', function () {
      module('when location is FR TLD', function () {
        test('it redirects to the URL on the ORG TLD', async function (assert) {
          // given
          campaign.identityProvider = 'FWB';

          _stubLocation('https://app.pix.fr/campaign/NEW_CODE');

          // when
          await route.afterModel(campaign, transition);

          // then
          sinon.assert.calledWithExactly(Location.replace, 'https://app.pix.org/campaign/NEW_CODE');
          assert.ok(true);
        });
      });

      module('when location is ORG TLD', function () {
        test('it does not redirect', async function (assert) {
          // given
          campaign.identityProvider = 'FWB';

          _stubLocation('https://app.pix.org/campaign/NEW_CODE');

          // when
          await route.afterModel(campaign, transition);

          // then
          sinon.assert.notCalled(Location.replace);
          assert.ok(true);
        });
      });
    });
  });
});

function _stubLocation(url) {
  const newUrl = new URL(url);
  sinon.stub(Location, 'getHref').returns(newUrl.href);
  sinon.stub(Location, 'replace');
  sinon.stub(Location, 'reload');
}
