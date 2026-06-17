import { OrganizationLearnerParticipationStatuses } from '../../../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
import { Eligibility } from '../../../../../src/quest/domain/models/quests/aggregates/Eligibility.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Domain | Models | Eligibility ', function () {
  describe('#constructor', function () {
    it('should remap passages to correct format', function () {
      // given
      const passages = [
        {
          status: OrganizationLearnerParticipationStatuses.STARTED,
          referenceId: 1,
          isTerminated: false,
        },
      ];

      // when
      const result = new Eligibility({ passages });

      // then
      expect(result.passages).lengthOf(1);
      expect(result.passages[0]).deep.equal({
        status: OrganizationLearnerParticipationStatuses.STARTED,
        moduleId: 1,
        isTerminated: false,
      });
    });
  });

  describe('#hasCampaignParticipation', function () {
    it('Should return true if campaign participation exists', function () {
      // given
      const campaignParticipations = [{ id: 1 }];
      const eligibility = new Eligibility({ campaignParticipations });

      // when
      const result = eligibility.hasCampaignParticipation(1);

      // then
      expect(result).to.be.true;
    });

    it('Should return false if campaign participation does not exist', function () {
      // given
      const campaignParticipations = [{ id: 2 }];
      const eligibility = new Eligibility({ campaignParticipations });

      // when
      const result = eligibility.hasCampaignParticipation(1);

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
