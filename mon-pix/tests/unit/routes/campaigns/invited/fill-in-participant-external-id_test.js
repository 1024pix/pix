import EmberObject from '@ember/object';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaigns/invited/fill-in-participant-external-id', function () {
  setupTest();

  let route, campaign;

  beforeEach(function () {
    route = this.owner.lookup('route:campaigns.invited.fill-in-participant-external-id');
    route.campaignStorage = { get: sinon.stub(), set: sinon.stub() };
    route.modelFor = sinon.stub();
    route.replaceWith = sinon.stub();
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
    it('should redirect to entrance page if an external id is already set', async function () {
      //given
      campaign = EmberObject.create({
        idPixLabel: 'indentifiant externe',
      });
      route.campaignStorage.get.withArgs(campaign.code, 'participantExternalId').returns('someID');

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.entrance', campaign.code);
    });

    it('should redirect to entrance page if an external id is not required', async function () {
      //given
      campaign = EmberObject.create({
        idPixLabel: null,
      });
      route.campaignStorage.get.withArgs(campaign.code, 'participantExternalId').returns(null);

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.calledWith(route.replaceWith, 'campaigns.entrance', campaign.code);
    });

    it('should not redirect if an external id is required and not already set', async function () {
      //given
      campaign = EmberObject.create({
        idPixLabel: 'identifiant externe',
      });
      route.campaignStorage.get.withArgs(campaign.code, 'participantExternalId').returns(null);

      //when
      await route.afterModel(campaign);

      //then
      sinon.assert.notCalled(route.replaceWith);
    });
  });
});
