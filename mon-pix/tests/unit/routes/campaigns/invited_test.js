import EmberObject from '@ember/object';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Invited', function () {
  setupTest();

  let route, campaign;

  beforeEach(function () {
    route = this.owner.lookup('route:campaigns.invited');
    route.modelFor = sinon.stub();
    route.replaceWith = sinon.stub();
    route.campaignStorage = { get: sinon.stub() };
  });

  describe('#beforeModel', function () {
    it('should redirect to entry point when /prescrit is directly set in the url', async function () {
      //when
      await route.beforeModel({ from: null });

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.entry-point');
    });

    it('should continue en entrance route when from is set', async function () {
      //when
      await route.beforeModel({ from: 'campaigns.entry-point' });

      //then
      sinon.assert.notCalled(route.replaceWith);
    });
  });

  describe('#model', function () {
    it('should load model', async function () {
      //when
      await route.model();

      //then
      sinon.assert.calledWith(route.modelFor, 'campaigns');
    });
  });

  describe('#afterModel', function () {
    it('should redirect to student sco invited page when association is needed', async function () {
      //given
      campaign = EmberObject.create({
        isRestricted: true,
        isOrganizationSCO: true,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(false);

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.invited.student-sco', campaign.code);
    });

    it('should redirect to student sup invited page when association is needed', async function () {
      //given
      campaign = EmberObject.create({
        isRestricted: true,
        isOrganizationSUP: true,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(false);

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.invited.student-sup', campaign.code);
    });

    it('should redirect to fill in participant external otherwise', async function () {
      //given
      campaign = EmberObject.create({
        isRestricted: false,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'associationDone').returns(false);

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.invited.fill-in-participant-external-id', campaign.code);
    });
  });
});
