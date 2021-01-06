import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import createGlimmerComponent from '../../helpers/create-glimmer-component';
import { A } from '@ember/array';

describe('Unit | Component | resume-campaign-banner-component ', function() {

  setupTest();

  let component;

  const campaignNotFinished = EmberObject.create({
    isShared: false,
    createdAt: '2018-01-01',
    campaign: EmberObject.create({
      code: 'AZERTY0',
      isAssessment: true,
    }),
  });
  const oldCampaignNotFinished = EmberObject.create({
    isShared: false,
    createdAt: '2017-01-01',
    campaign: EmberObject.create({
      code: 'AZERTY1',
      isAssessment: true,
    }),
  });
  const campaignFinished = EmberObject.create({
    isShared: true,
    createdAt: '2018-12-12',
    campaign: EmberObject.create({
      code: 'AZERTY2',
      isAssessment: true,
    }),
    assessment: EmberObject.create({
      isCompleted: true,
    }),
  });
  const campaignFinishedButNotShared = EmberObject.create({
    isShared: false,
    createdAt: '2017-12-12',
    campaign: EmberObject.create({
      code: 'AZERTY3',
      isAssessment: true,
    }),
    assessment: EmberObject.create({
      isCompleted: true,
    }),
  });

  beforeEach(function() {
    component = createGlimmerComponent('component:resume-campaign-banner');
  });

  describe('#campaignParticipationState', function() {
    it('should return the most recent campaign among campaigns not finished and not shared', function() {
      // given
      const listCampaignParticipations = [oldCampaignNotFinished, campaignNotFinished];
      component.args.campaignParticipations = listCampaignParticipations;

      const expectedResult = {
        title: campaignNotFinished.campaign.title,
        code: campaignNotFinished.campaign.code,
        isTypeAssessment: true,
        assessment: campaignNotFinished.assessment,
      };

      // when
      const campaignParticipationState = component.campaignParticipationState;

      // then
      expect(campaignParticipationState).to.deep.equal(expectedResult);
    });

    it('should return the most recent campaign among campaigns not finished and not shared dynamically', function() {
      // given
      const participations = A([]);
      component.args.campaignParticipations = participations;

      // then
      expect(component.campaignParticipationState).to.equal(null);

      // when
      const updatableCampaignNotFinished = EmberObject.create({
        isShared: false,
        createdAt: '2018-01-01',
        isTypeAssessment: true,
        campaign: EmberObject.create({
          code: 'AZERTY0',
        }),
      });
      participations.addObject(oldCampaignNotFinished);
      participations.addObject(updatableCampaignNotFinished);

      // then
      expect(component.campaignParticipationState.code).to.equal('AZERTY0');

      updatableCampaignNotFinished.createdAt = '2000-05-13';

      expect(component.campaignParticipationState.code).to.equal(oldCampaignNotFinished.campaign.code);
    });

    it('should return the most recent campaign among campaigns not shared', function() {
      // given
      const listCampaignParticipations = [oldCampaignNotFinished, campaignFinishedButNotShared];
      component.args.campaignParticipations = listCampaignParticipations;

      const expectedResult = {
        title: campaignFinishedButNotShared.campaign.title,
        code: campaignFinishedButNotShared.campaign.code,
        isTypeAssessment: true,
        assessment: campaignFinishedButNotShared.assessment,
      };

      // when
      const campaignParticipationState = component.campaignParticipationState;

      // then
      expect(campaignParticipationState).to.deep.equal(expectedResult);
    });

    it('should return the only campaign not finished or not shared', function() {
      // given
      const listCampaignParticipations = [campaignFinished, campaignFinishedButNotShared];
      component.args.campaignParticipations = listCampaignParticipations;

      const expectedResult = {
        title: campaignFinishedButNotShared.campaign.title,
        code: campaignFinishedButNotShared.campaign.code,
        isTypeAssessment: true,
        assessment: campaignFinishedButNotShared.assessment,
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
