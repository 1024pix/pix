import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';

describe('Unit | Component | resume-campaign-banner-component ', function() {

  setupTest('component:resume-campaign-banner', {});

  let component;

  const campaignWanted = EmberObject.create({
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
  const campaignFinish = EmberObject.create({
    isShared: true,
    campaign: EmberObject.create({
      code: 'AZERTY2',
    })
  });

  beforeEach(function() {
    component = this.subject();
  });

  describe('#campaignToResume', function() {

    it('should return the most recent not shared campaign', function() {
      // given
      const listCampaignParticipations = [campaignFinish, oldCampaignNotFinished, campaignWanted];
      component.set('campaignParticipations', listCampaignParticipations);

      // when
      const campaignToResume = component.get('campaignToResume');

      // then
      expect(campaignToResume).to.equal(campaignWanted.campaign);
    });

    it('should return undefined when all campaign are finished', function() {
      // given
      const listCampaignParticipations = [campaignFinish];
      component.set('campaignParticipations', listCampaignParticipations);

      // when
      const campaignToResume = component.get('campaignToResume');

      // then
      expect(campaignToResume).to.equal(null);
    });

  });

});
