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

  describe('#buildEligibilityScopedByCampaignParticipationId', function () {
    it('return new instance of Eligibility scoped on given CampaignParticipation', function () {
      // given
      const organization = Symbol('orga');
      const organizationLearner = Symbol('orgaLearner');
      const campaignParticipations = [{ id: 1 }, { id: 2 }];
      const eligibility = new Eligibility({
        organization,
        organizationLearner,
        campaignParticipations,
      });

      // when
      const scopedEligibility = eligibility.buildEligibilityScopedByCampaignParticipationId({
        campaignParticipationId: 2,
      });

      // then
      expect(scopedEligibility).to.deepEqualInstance(
        new Eligibility({
          organization,
          organizationLearner,
          campaignParticipations: [{ id: 2 }],
        }),
      );
    });
  });
});
