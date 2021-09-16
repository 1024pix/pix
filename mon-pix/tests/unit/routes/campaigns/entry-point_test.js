import EmberObject from '@ember/object';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Entry Point', function() {
  setupTest();

  let route;

  const campaign = EmberObject.create({
    id: 3,
    code: 'NEW_CODE',
  });

  beforeEach(function() {
    route = this.owner.lookup('route:campaigns.entry-point');

    route.store = { queryRecord: sinon.stub() };
    route.replaceWith = sinon.stub();
    route.modelFor = sinon.stub();
    route.campaignStorage = { set: sinon.stub() };
  });

  describe('#model', function() {
    it('should load model', async function() {
      //given/when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'campaigns');
    });
  });

  describe('#redirect', function() {
    describe('user not connected', function() {
      it('should not call queryRecord to retrieve campaignParticipation', async function() {
        //given
        const transition = { to: { queryParams: {} } };
        route.currentUser = undefined;

        //when
        await route.redirect(campaign, transition);

        //then
        sinon.assert.notCalled(route.store.queryRecord);
      });

      it('should redirect to start-or-resume', async function() {
        //given
        const transition = { to: { queryParams: {} } };
        route.currentUser = undefined;
        campaign.isArchived = false;

        //when
        await route.redirect(campaign, transition);

        //then
        sinon.assert.calledWith(route.replaceWith, 'campaigns.start-or-resume');
      });

      describe('archived campaign', function() {
        it('should redirect to not-found page', async function() {
          //given
          const transition = { to: { queryParams: {} } };
          route.currentUser = undefined;
          campaign.isArchived = true;

          //when
          await route.redirect(campaign, transition);

          //then
          sinon.assert.calledWith(route.replaceWith, 'campaigns.campaign-not-found');
        });
      });
    });

    describe('user connected', function() {
      it('should call queryRecord to retrieve campaignParticipation', async function() {
        //given
        const transition = { to: { queryParams: {} } };
        route.currentUser = { user: {
          id: 12,
        } };

        //when
        await route.redirect(campaign, transition);

        //then
        sinon.assert.calledWith(route.store.queryRecord, 'campaignParticipation', {
          campaignId: 3,
          userId: 12,
        });
      });

      it('should redirect to start-or-resume', async function() {
        //given
        const transition = { to: { queryParams: {} } };
        route.currentUser = { user: {
          id: 12,
        } };
        campaign.isArchived = false;

        //when
        await route.redirect(campaign, transition);

        //then
        sinon.assert.calledWith(route.replaceWith, 'campaigns.start-or-resume');
      });

      describe('archived campaign', function() {
        it('should redirect to not-found page with no participation', async function() {
          //given
          const transition = { to: { queryParams: {} } };
          route.currentUser = { user: {
            id: 12,
          } };
          campaign.isArchived = true;

          route.store.queryRecord.withArgs('campaignParticipation', {
            campaignId: 3,
            userId: 12,
          }).resolves(null);

          //when
          await route.redirect(campaign, transition);

          //then
          sinon.assert.calledWith(route.replaceWith, 'campaigns.campaign-not-found');
        });

        it('should redirect to start or resume page with participation', async function() {
          //given
          const transition = { to: { queryParams: {} } };
          route.currentUser = { user: {
            id: 12,
          } };
          campaign.isArchived = true;

          route.store.queryRecord.withArgs('campaignParticipation', {
            campaignId: 3,
            userId: 12,
          }).resolves('Ma Participation');

          //when
          await route.redirect(campaign, transition);

          //then
          sinon.assert.calledWith(route.replaceWith, 'campaigns.start-or-resume');
        });
      });
    });

    describe('participantExternalId', function() {
      describe('when there are participantExternalId', function() {
        it('sets the current participantExternalId', async function() {
          //given
          const transition = { to: { queryParams: { participantExternalId: 'externalId' } } };
          route.currentUser = { user: {
            id: 12,
          } };

          //when
          await route.redirect(campaign, transition);

          //then
          sinon.assert.calledWith(route.campaignStorage.set, campaign.code, 'participantExternalId', 'externalId');
        });
      });

      describe('when there is no participantExternalId', function() {
        it('does not set the participantExternalId', async function() {
          //given
          const transition = { to: { queryParams: { } } };
          route.currentUser = { user: {
            id: 12,
          } };

          //when
          await route.redirect(campaign, transition);

          //then
          sinon.assert.notCalled(route.campaignStorage.set);
        });
      });
    });
  });
});
