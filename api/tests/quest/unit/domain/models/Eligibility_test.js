import { Eligibility } from '../../../../../src/quest/domain/models/Eligibility.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Eligibility ', function () {
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

  describe('#hasCampaignParticipationForTargetProfileId', function () {
    it('should return true if has campaign participation for given target profile', function () {
      // given
      const campaignParticipations = [
        { id: 1, targetProfileId: 10 },
        { id: 2, targetProfileId: 20 },
      ];
      const eligiblity = new Eligibility({ campaignParticipations });

      // when
      const result = eligiblity.hasCampaignParticipationForTargetProfileId(10);

      // then
      expect(result).to.be.true;
    });

    it('should return false if there are no campaign participation for given target profile', function () {
      // given
      const campaignParticipations = [
        { id: 1, targetProfileId: 10 },
        { id: 2, targetProfileId: 20 },
      ];
      const eligiblity = new Eligibility({ campaignParticipations });

      // when
      const result = eligiblity.hasCampaignParticipationForTargetProfileId(1);

      // then
      expect(result).to.be.false;
    });
  });
});
