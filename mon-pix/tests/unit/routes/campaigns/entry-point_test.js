import EmberObject from '@ember/object';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Entry Point', function () {
  setupTest();

  let route, campaign;

  beforeEach(function () {
    campaign = EmberObject.create({
      id: 3,
      code: 'NEW_CODE',
    });
    route = this.owner.lookup('route:campaigns.entry-point');

    route.store = { queryRecord: sinon.stub() };
    route.replaceWith = sinon.stub();
    route.modelFor = sinon.stub();
    route.campaignStorage = { set: sinon.stub(), clear: sinon.stub() };
    route.session = { isAuthenticated: false, invalidate: sinon.stub() };
    route.currentUser = { user: {} };
  });

  describe('#beforeModel', function () {
    it('should invalidate session when a user is connected and anonymous', async function () {
      //given
      route.session.isAuthenticated = true;
      route.currentUser.user.isAnonymous = true;

      //when
      await route.beforeModel();

      //then
      sinon.assert.called(route.session.invalidate);
    });

    it('should not invalidate session when a user is connected but not anonymous', async function () {
      //given
      route.session.isAuthenticated = true;
      route.currentUser.user.isAnonymous = false;

      //when
      await route.beforeModel();

      //then
      sinon.assert.notCalled(route.session.invalidate);
    });
  });

  describe('#model', function () {
    it('should load model', async function () {
      //given/when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'campaigns');
    });
  });

  describe('#afterModel', function () {
    let transition;
    beforeEach(function () {
      transition = { to: { queryParams: {} } };
    });

    it('should erase campaign storage', async function () {
      //given/when
      await route.afterModel({ code: 'CODE' }, transition);

      //then
      sinon.assert.calledWith(route.campaignStorage.clear, 'CODE');
    });

    describe('user not connected', function () {
      beforeEach(function () {
        route.session.isAuthenticated = false;
        route.currentUser = undefined;
      });

      it('should not call queryRecord to retrieve campaignParticipation', async function () {
        //when
        await route.afterModel(campaign, transition);

        //then
        sinon.assert.notCalled(route.store.queryRecord);
      });

      it('should redirect to landing page', async function () {
        //when
        await route.afterModel(campaign, transition);

        //then
        sinon.assert.calledWith(route.replaceWith, 'campaigns.campaign-landing-page');
      });

      describe('archived campaign', function () {
        beforeEach(function () {
          campaign.isArchived = true;
        });

        it('should redirect to campaign archived error', async function () {
          //when
          await route.afterModel(campaign, transition);

          //then
          sinon.assert.calledWith(route.replaceWith, 'campaigns.archived-error');
        });
      });
    });

    describe('user connected', function () {
      beforeEach(function () {
        route.currentUser = { user: { id: 12 } };
        route.session.isAuthenticated = true;
      });

      it('should call queryRecord to retrieve campaignParticipation', async function () {
        //when
        await route.afterModel(campaign, transition);

        //then
        sinon.assert.calledWith(route.store.queryRecord, 'campaignParticipation', {
          campaignId: 3,
          userId: 12,
        });
      });

      it('should redirect to landing page when no ongoing campaign participation', async function () {
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
        sinon.assert.calledWith(route.replaceWith, 'campaigns.campaign-landing-page');
      });

      it('should redirect to entrance when ongoing campaign participation is existing', async function () {
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
        sinon.assert.calledWith(route.replaceWith, 'campaigns.entrance');
      });

      describe('archived campaign', function () {
        beforeEach(function () {
          campaign.isArchived = true;
        });

        it('should redirect to campaign archived error with no participation', async function () {
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
          sinon.assert.calledWith(route.replaceWith, 'campaigns.archived-error');
        });

        it('should redirect to entrance with participation', async function () {
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
          sinon.assert.calledWith(route.replaceWith, 'campaigns.entrance');
        });
      });
    });

    describe('participantExternalId', function () {
      describe('when there are participantExternalId', function () {
        it('sets the current participantExternalId', async function () {
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
        });
      });

      describe('when there is no participantExternalId', function () {
        it('does not set the participantExternalId', async function () {
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
        });
      });
    });

    describe('retry', function () {
      describe('when there are retry', function () {
        it('sets the current retry', async function () {
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
        });
      });

      describe('when there is no retry', function () {
        it('does not set the retry', async function () {
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
        });
      });
    });
  });
});
