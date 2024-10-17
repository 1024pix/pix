import { Eligibility } from '../../../../../src/quest/domain/models/Eligibility.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Eligibility ', function () {
  describe('#campaignParticipations', function () {
    it('Should return an object with targetProfileIds property', function () {
      // given
      const campaignParticipations = [{ targetProfileId: 1 }, { targetProfileId: 2 }];
      const eligiblity = new Eligibility({ campaignParticipations });

      // when
      const result = eligiblity.campaignParticipations;

      // then
      expect(result.targetProfileIds).to.deep.equal([1, 2]);
    });

    it('Should return an empty array on targetProfileIds property', function () {
      // given
      const campaignParticipations = [];
      const eligiblity = new Eligibility({ campaignParticipations });

      // when
      const result = eligiblity.campaignParticipations;

      // then
      expect(result.targetProfileIds).to.deep.equal([]);
    });
  });

  describe('#hasCampaignParticipation', function () {
    it('Should return true if campaign participation exists', function () {
      // given
      const campaignParticipations = [{ id: 1 }];
      const eligiblity = new Eligibility({ campaignParticipations });

      // when
      const result = eligiblity.hasCampaignParticipation(1);

      // then
      expect(result).to.be.true;
    });

    it('Should return false if campaign participation does not exist', function () {
      // given
      const campaignParticipations = [{ id: 2 }];
      const eligiblity = new Eligibility({ campaignParticipations });

      // when
      const result = eligiblity.hasCampaignParticipation(1);

      // then
      expect(result).to.be.false;
    });
  });

  describe('getTargetProfileForCampaignParticipation', function () {
    it('Should return target profile ID for campaign participation', function () {
      // given
      const campaignParticipations = [{ id: 1, targetProfileId: 10 }];
      const eligiblity = new Eligibility({ campaignParticipations });

      // when
      const result = eligiblity.getTargetProfileForCampaignParticipation(1);

      // then
      expect(result).to.equal(10);
    });

    it('Should return null when the campaign participation does not exist', function () {
      // given
      const campaignParticipations = [{ id: 1, targetProfileId: 10 }];
      const eligiblity = new Eligibility({ campaignParticipations });

      // when
      const result = eligiblity.getTargetProfileForCampaignParticipation(2);

      // then
      expect(result).to.be.null;
    });
  });
});
