import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | resume-campaign-banner-component', function() {

  setupTest();

  let component;

  const campaignNotFinished = EmberObject.create({
    isShared: false,
    createdAt: '2018-01-01',
    campaign: EmberObject.create({
      code: 'AZERTY0',
      isProfilesCollection: true,
    }),
  });
  const oldCampaignNotFinished = EmberObject.create({
    isShared: false,
    createdAt: '2017-01-01',
    campaign: EmberObject.create({
      code: 'AZERTY1',
      isProfilesCollection: true,
    }),
  });
  const campaignFinished = EmberObject.create({
    isShared: true,
    createdAt: '2018-12-12',
    campaign: EmberObject.create({
      code: 'AZERTY2',
      isProfilesCollection: true,
    }),
  });

  beforeEach(function() {
    component = createGlimmerComponent('component:resume-campaign-banner');
  });

  describe('#campaignParticipationState', function() {
    it('should return the most recent campaign participation state among campaigns not finished', function() {
      // given
      const listCampaignParticipations = [oldCampaignNotFinished, campaignNotFinished];
      component.args.campaignParticipations = listCampaignParticipations;

      const expectedResult = {
        code: campaignNotFinished.campaign.code,
        isProfilesCollection: true,
      };

      // when
      const campaignParticipationState = component.campaignParticipationState;

      // then
      expect(campaignParticipationState).to.deep.equal(expectedResult);
    });

    it('should return null when all campaign are finished', function() {
      // given
      const listCampaignParticipations = [campaignFinished];
      component.args.campaignParticipations = listCampaignParticipations;

      // when
      const campaignParticipationState = component.campaignParticipationState;

      // then
      expect(campaignParticipationState).to.equal(null);
    });
  });
});
