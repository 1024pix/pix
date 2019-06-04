import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';

describe('Unit | Component | resume-campaign-banner-component ', function() {

  setupTest();

  let component;

  const campaignNotFinished = EmberObject.create({
    isShared: false,
    createdAt: '2018-01-01',
    campaign: EmberObject.create({
      code: 'AZERTY0',
    })
  });
  const oldCampaignNotFinished = EmberObject.create({
    isShared: false,
    createdAt: '2017-01-01',
    campaign: EmberObject.create({
      code: 'AZERTY1',
    })
  });
  const campaignFinished = EmberObject.create({
    isShared: true,
    createdAt: '2018-12-12',
    campaign: EmberObject.create({
      code: 'AZERTY2',
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
    }),
    assessment: EmberObject.create({
      isCompleted: true,
    }),
  });

  beforeEach(function() {
    component = this.owner.lookup('component:resume-campaign-banner');
  });

  describe('#campaignToResumeOrShare', function() {

    it('should return the most recent campaign among campaigns not finished and not shared', function() {
      // given
      const listCampaignParticipations = [oldCampaignNotFinished, campaignNotFinished];
      component.set('campaignParticipations', listCampaignParticipations);

      const expectedResult = {
        title: campaignNotFinished.campaign.title,
        code: campaignNotFinished.campaign.code,
        assessment: campaignNotFinished.assessment
      };

      // when
      const campaignToResumeOrShare = component.get('campaignToResumeOrShare');

      // then
      expect(campaignToResumeOrShare).to.deep.equal(expectedResult);
    });

    it('should return the most recent campaign among campaigns not shared', function() {
      // given
      const listCampaignParticipations = [oldCampaignNotFinished, campaignFinishedButNotShared];
      component.set('campaignParticipations', listCampaignParticipations);
      const expectedResult = {
        title: campaignFinishedButNotShared.campaign.title,
        code: campaignFinishedButNotShared.campaign.code,
        assessment: campaignFinishedButNotShared.assessment
      };

      // when
      const campaignToResumeOrShare = component.get('campaignToResumeOrShare');

      // then
      expect(campaignToResumeOrShare).to.deep.equal(expectedResult);
    });

    it('should return the only campaign not finished or not shared', function() {
      // given
      const listCampaignParticipations = [campaignFinished, campaignFinishedButNotShared];
      component.set('campaignParticipations', listCampaignParticipations);
      const expectedResult = {
        title: campaignFinishedButNotShared.campaign.title,
        code: campaignFinishedButNotShared.campaign.code,
        assessment: campaignFinishedButNotShared.assessment
      };

      // when
      const campaignToResumeOrShare = component.get('campaignToResumeOrShare');

      // then
      expect(campaignToResumeOrShare).to.deep.equal(expectedResult);
    });

    it('should return null when all campaign are finished', function() {
      // given
      const listCampaignParticipations = [campaignFinished];
      component.set('campaignParticipations', listCampaignParticipations);

      // when
      const campaignToResumeOrShare = component.get('campaignToResumeOrShare');

      // then
      expect(campaignToResumeOrShare).to.equal(null);
    });
  });
});
