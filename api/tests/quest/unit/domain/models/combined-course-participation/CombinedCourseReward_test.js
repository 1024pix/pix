import {
  CombinedCourseReward,
  CombinedCourseRewardStatuses,
} from '../../../../../../src/quest/domain/models/combined-course-participation/CombinedCourseReward.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Quest | Unit | Domain | Models | CombinedCourseReward', function () {
  let organizationId, name, code, questId;

  beforeEach(function () {
    questId = 2;
    organizationId = 1;
    name = 'name';
    code = 'code';
  });

  it('should be correctly instantiated', function () {
    // given
    const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
      name,
      code,
      organizationId,
      questId,
      combinedCourseItems: [{ campaignId: 2 }],
      rewardType: 'attestations',
      rewardId: 1,
    });
    const attestationDetails = domainBuilder.buildAttestationUserDetail({
      obtainedAt: null,
      label: 'label TEST',
      templateName: 'template-name',
    });

    // when
    const combinedCourseReward = new CombinedCourseReward({ combinedCourseDetails, reward: attestationDetails });

    // then
    expect(combinedCourseReward.id).equal(attestationDetails.id);
    expect(combinedCourseReward.type).equal('attestations');
    expect(combinedCourseReward.status).equal(CombinedCourseRewardStatuses.NOT_STARTED);
    expect(combinedCourseReward.label).equal('label TEST');
    expect(combinedCourseReward.templateName).equal('template-name');
    expect(combinedCourseReward.data).to.contains({ attestationKey: attestationDetails.attestationKey });
  });

  describe('#status', function () {
    it('should have status not started when combined course is not started and reward is not obtained', function () {
      // given
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [{ campaignId: 2 }],
        rewardType: 'attestations',
        rewardId: 1,
      });
      const attestationDetails = domainBuilder.buildAttestationUserDetail({
        obtainedAt: null,
      });

      // when
      const combinedCourseReward = new CombinedCourseReward({ combinedCourseDetails, reward: attestationDetails });

      // then
      expect(combinedCourseReward.status).equal(CombinedCourseRewardStatuses.NOT_STARTED);
    });

    it('should have status obtained when combined course is not started and reward is obtained', function () {
      // given
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [{ campaignId: 2 }],
        rewardType: 'attestations',
        rewardId: 1,
      });
      const attestationDetails = domainBuilder.buildAttestationUserDetail({
        obtainedAt: new Date(),
      });

      // when
      const combinedCourseReward = new CombinedCourseReward({ combinedCourseDetails, reward: attestationDetails });

      // then
      expect(combinedCourseReward.status).equal(CombinedCourseRewardStatuses.OBTAINED);
    });

    it('should have status started when combined course is started and reward is not obtained', function () {
      // given
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [{ campaignId: 2 }],
        rewardType: 'attestations',
        rewardId: 1,
      });

      const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({ passages: [], campaignParticipations: [] });
      combinedCourseDetails.setDataAndGenerateItems({
        dataForQuest,
        participation: domainBuilder.buildOrganizationLearnerParticipation({
          status: OrganizationLearnerParticipationStatuses.STARTED,
          type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        }),
      });

      const attestationDetails = domainBuilder.buildAttestationUserDetail({
        obtainedAt: null,
      });

      // when
      const combinedCourseReward = new CombinedCourseReward({ combinedCourseDetails, reward: attestationDetails });

      // then
      expect(combinedCourseReward.status).equal(CombinedCourseRewardStatuses.STARTED);
    });

    it('should have status obtained when combined course is started and reward is obtained', function () {
      // given
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [{ campaignId: 2 }],
        rewardType: 'attestations',
        rewardId: 1,
      });

      const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({ passages: [], campaignParticipations: [] });
      combinedCourseDetails.setDataAndGenerateItems({
        dataForQuest,
        participation: domainBuilder.buildOrganizationLearnerParticipation({
          status: OrganizationLearnerParticipationStatuses.STARTED,
          type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        }),
      });

      const attestationDetails = domainBuilder.buildAttestationUserDetail({
        obtainedAt: new Date(),
      });

      // when
      const combinedCourseReward = new CombinedCourseReward({ combinedCourseDetails, reward: attestationDetails });

      // then
      expect(combinedCourseReward.status).equal(CombinedCourseRewardStatuses.OBTAINED);
    });

    it('should have status obtained when combined course is completed and reward is obtained', function () {
      // given
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [{ campaignId: 2 }],
        rewardType: 'attestations',
        rewardId: 1,
      });

      const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({ passages: [], campaignParticipations: [] });
      combinedCourseDetails.setDataAndGenerateItems({
        dataForQuest,
        participation: domainBuilder.buildOrganizationLearnerParticipation({
          status: OrganizationLearnerParticipationStatuses.COMPLETED,
          type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        }),
      });

      const attestationDetails = domainBuilder.buildAttestationUserDetail({
        obtainedAt: new Date(),
      });

      // when
      const combinedCourseReward = new CombinedCourseReward({ combinedCourseDetails, reward: attestationDetails });

      // then
      expect(combinedCourseReward.status).equal(CombinedCourseRewardStatuses.OBTAINED);
    });

    it('should have status not obtained when combined course is completed and reward is not obtained', function () {
      // given
      const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
        name,
        code,
        organizationId,
        questId,
        combinedCourseItems: [{ campaignId: 2 }],
        rewardType: 'attestations',
        rewardId: 1,
      });

      const dataForQuest = domainBuilder.buildCombinedCourseDataForQuest({ passages: [], campaignParticipations: [] });
      combinedCourseDetails.setDataAndGenerateItems({
        dataForQuest,
        participation: domainBuilder.buildOrganizationLearnerParticipation({
          status: OrganizationLearnerParticipationStatuses.COMPLETED,
          type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        }),
      });

      const attestationDetails = domainBuilder.buildAttestationUserDetail({
        obtainedAt: null,
      });

      // when
      const combinedCourseReward = new CombinedCourseReward({ combinedCourseDetails, reward: attestationDetails });

      // then
      expect(combinedCourseReward.status).equal(CombinedCourseRewardStatuses.NOT_OBTAINED);
    });
  });
});
