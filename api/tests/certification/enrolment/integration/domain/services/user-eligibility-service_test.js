import dayjs from 'dayjs';

import { LABEL_FOR_CORE } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityCalculator.js';
import { UserEligibilityList } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityList.js';
import { services } from '../../../../../../src/certification/enrolment/domain/services/index.js';
import { CampaignParticipationStatuses } from '../../../../../../src/prescription/shared/domain/constants.js';
import { PIX_ORIGIN } from '../../../../../../src/shared/domain/constants.js';
import { SCOPES } from '../../../../../../src/shared/domain/models/BadgeDetails.js';
import {
  ComplementaryCertificationCourseResult,
  KnowledgeElement,
} from '../../../../../../src/shared/domain/models/index.js';
import { ACTIVE_STATUS } from '../../../../../../src/shared/infrastructure/datasources/learning-content/skill-datasource.js';
import { databaseBuilder, expect, mockLearningContent } from '../../../../../test-helper.js';
import * as learningContentBuilder from '../../../../../tooling/learning-content-builder/index.js';

describe('Certification | Enrolment | Integration | Domain | Services | UserEligibilityService', function () {
  let userEligibilityService;

  beforeEach(function () {
    userEligibilityService = services.userEligibilityService;
  });

  describe('#getUserEligibilityList', function () {
    let userId = 123;
    let someDate;

    beforeEach(function () {
      someDate = new Date('2020-01-01');
      userId = databaseBuilder.factory.buildUser().id;
      _mockLearningContent();
      _makeUserCoreCertifiable({ userId, refDate: someDate });
      return databaseBuilder.commit();
    });

    it('should compute and return user eligibility list (core certifiable)', async function () {
      // when
      const userEligibilityList = await userEligibilityService.getUserEligibilityList({
        userId,
        limitDate: someDate,
      });

      // then
      expect(userEligibilityList).to.be.instanceOf(UserEligibilityList);
      expect(userEligibilityList.toDTO()).to.deep.equal({
        userId,
        date: someDate,
        eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: false }],
        eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true }],
      });
    });

    context('when user has some certifiable badge acquisitions (outdated or not) - V2 ONLY', function () {
      const validEligibilityData = {};
      const outdatedEligibilityData = {};

      beforeEach(function () {
        _makeUserObtainStillValidCertifiableBadgeWithCertification({
          userId,
          refDate: someDate,
          dataToFill: validEligibilityData,
        });
        _makeUserObtainOutdatedCertifiableBadge({
          userId,
          refDate: someDate,
          dataToFill: outdatedEligibilityData,
        });
        return databaseBuilder.commit();
      });

      it('should compute and return user eligibility list completed with those complementary eligibilites', async function () {
        // when
        const userEligibilityList = await userEligibilityService.getUserEligibilityList({
          userId,
          limitDate: someDate,
        });

        // then
        expect(userEligibilityList).to.be.instanceOf(UserEligibilityList);
        expect(userEligibilityList.toDTO()).to.deep.equal({
          userId,
          date: someDate,
          eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: false }],
          eligibilitiesV2: [
            { certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true },
            {
              certification: validEligibilityData.complementaryCertificationKey,
              isCertifiable: true,
              isV2: true,
              complementaryCertificationBadgeId: validEligibilityData.complementaryCertificationBadgeId,
              complementaryCertificationId: validEligibilityData.complementaryCertificationId,
              campaignId: validEligibilityData.campaignId,
              badgeKey: validEligibilityData.badgeKey,
              why: { isOutdated: false, isCoreCertifiable: true },
              info: { hasComplementaryCertificationForThisLevel: true, versionsBehind: 0 },
            },
            {
              certification: outdatedEligibilityData.complementaryCertificationKey,
              isCertifiable: false,
              isV2: true,
              complementaryCertificationBadgeId: outdatedEligibilityData.complementaryCertificationBadgeId,
              complementaryCertificationId: outdatedEligibilityData.complementaryCertificationId,
              campaignId: outdatedEligibilityData.campaignId,
              badgeKey: outdatedEligibilityData.badgeKey,
              why: { isOutdated: true, isCoreCertifiable: true },
              info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 1 },
            },
          ],
        });
      });
    });
  });
});

function _mockLearningContent() {
  mockLearningContent({
    competences: [
      learningContentBuilder.buildCompetence({
        id: 'competenceA',
        origin: PIX_ORIGIN,
      }),
      learningContentBuilder.buildCompetence({
        id: 'competenceB',
        origin: PIX_ORIGIN,
      }),
      learningContentBuilder.buildCompetence({
        id: 'competenceC',
        origin: PIX_ORIGIN,
      }),
      learningContentBuilder.buildCompetence({
        id: 'competenceD',
        origin: PIX_ORIGIN,
      }),
      learningContentBuilder.buildCompetence({
        id: 'competenceE',
        origin: PIX_ORIGIN,
      }),
      learningContentBuilder.buildCompetence({
        id: 'competenceF',
        origin: PIX_ORIGIN,
      }),
      learningContentBuilder.buildCompetence({
        id: 'competenceG',
        origin: PIX_ORIGIN,
      }),
    ],
    skills: [
      learningContentBuilder.buildSkill({
        id: 'skill1_competenceA',
        competenceId: 'competenceA',
        status: ACTIVE_STATUS,
      }),
      learningContentBuilder.buildSkill({
        id: 'skill2_competenceA',
        competenceId: 'competenceA',
        status: ACTIVE_STATUS,
      }),
      learningContentBuilder.buildSkill({
        id: 'skill1_competenceB',
        competenceId: 'competenceB',
        status: ACTIVE_STATUS,
      }),
      learningContentBuilder.buildSkill({
        id: 'skill1_competenceC',
        competenceId: 'competenceC',
        status: ACTIVE_STATUS,
      }),
      learningContentBuilder.buildSkill({
        id: 'skill1_competenceD',
        competenceId: 'competenceD',
        status: ACTIVE_STATUS,
      }),
      learningContentBuilder.buildSkill({
        id: 'skill2_competenceD',
        competenceId: 'competenceD',
        status: ACTIVE_STATUS,
      }),
      learningContentBuilder.buildSkill({
        id: 'skill1_competenceE',
        competenceId: 'competenceE',
        status: ACTIVE_STATUS,
      }),
      learningContentBuilder.buildSkill({
        id: 'skill1_competenceF',
        competenceId: 'competenceF',
        status: ACTIVE_STATUS,
      }),
      learningContentBuilder.buildSkill({
        id: 'skill2_competenceG',
        competenceId: 'competenceG',
        status: ACTIVE_STATUS,
      }),
      learningContentBuilder.buildSkill({
        id: 'skill1_competenceG',
        competenceId: 'competenceG',
        status: ACTIVE_STATUS,
      }),
      learningContentBuilder.buildSkill({
        id: 'skill2_competenceG',
        competenceId: 'competenceG',
        status: ACTIVE_STATUS,
      }),
    ],
  });
}

function _makeUserCoreCertifiable({ userId, refDate }) {
  const oneDayBefore = dayjs(refDate).subtract(1, 'day').toDate();
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    competenceId: 'competenceA',
    skillId: 'skill1_competenceA',
    earnedPix: 4,
    createdAt: oneDayBefore,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    competenceId: 'competenceA',
    skillId: 'skill2_competenceA',
    earnedPix: 5,
    createdAt: oneDayBefore,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    competenceId: 'competenceB',
    skillId: 'skill1_competenceB',
    earnedPix: 10,
    createdAt: oneDayBefore,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    competenceId: 'competenceC',
    skillId: 'skill1_competenceC',
    earnedPix: 20,
    createdAt: oneDayBefore,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    competenceId: 'competenceD',
    skillId: 'skill1_competenceD',
    earnedPix: 2,
    createdAt: oneDayBefore,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    competenceId: 'competenceD',
    skillId: 'skill2_competenceD',
    earnedPix: 2,
    createdAt: oneDayBefore,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    competenceId: 'competenceD',
    skillId: 'skill3_competenceD',
    earnedPix: 4,
    createdAt: oneDayBefore,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    competenceId: 'competenceE',
    skillId: 'skill1_competenceE',
    earnedPix: 10,
    createdAt: oneDayBefore,
  });
}

function _makeUserObtainStillValidCertifiableBadgeWithCertification({ userId, refDate, dataToFill }) {
  const oneDayBefore = dayjs(refDate).subtract(1, 'day').toDate();
  const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
  dataToFill.badgeKey = 'VALID_BADGE_KEY';
  dataToFill.badgeId = databaseBuilder.factory.buildBadge({
    targetProfileId,
    key: dataToFill.badgeKey,
    isCertifiable: true,
  }).id;
  databaseBuilder.factory.buildBadgeCriterion({
    scope: SCOPES.CAMPAIGN_PARTICIPATION,
    threshold: 5,
    badgeId: dataToFill.badgeId,
    cappedTubes: [],
  });
  dataToFill.campaignId = databaseBuilder.factory.buildCampaign({
    targetProfileId,
  }).id;
  databaseBuilder.factory.buildCampaignSkill({ campaignId: dataToFill.campaignId, skillId: 'skill1_competenceF' });
  databaseBuilder.factory.buildCampaignSkill({ campaignId: dataToFill.campaignId, skillId: 'skill2_competenceF' });
  const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
    userId,
    campaignId: dataToFill.campaignId,
    status: CampaignParticipationStatuses.SHARED,
  }).id;
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    competenceId: 'competenceF',
    skillId: 'skill1_competenceF',
    status: KnowledgeElement.StatusType.VALIDATED,
    createdAt: oneDayBefore,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    competenceId: 'competenceF',
    skillId: 'skill2_competenceF',
    status: KnowledgeElement.StatusType.VALIDATED,
    createdAt: oneDayBefore,
  });
  databaseBuilder.factory.buildBadgeAcquisition({
    badgeId: dataToFill.badgeId,
    userId,
    campaignParticipationId,
    createdAt: oneDayBefore,
  });
  dataToFill.complementaryCertificationKey = 'VALID_COMPLEMENTARY_BADGE_KEY';
  dataToFill.complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
    key: dataToFill.complementaryCertificationKey,
  }).id;
  dataToFill.complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
    level: 1,
    complementaryCertificationId: dataToFill.complementaryCertificationId,
    badgeId: dataToFill.badgeId,
    detachedAt: null,
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    userId,
    isPublished: true,
    isCancelled: false,
    isRejectedForFraud: false,
  }).id;
  const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
    complementaryCertificationId: dataToFill.complementaryCertificationId,
    certificationCourseId,
    complementaryCertificationBadgeId: dataToFill.complementaryCertificationBadgeId,
  }).id;
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId: dataToFill.complementaryCertificationBadgeId,
    source: ComplementaryCertificationCourseResult.sources.PIX,
    acquired: true,
  });
}

function _makeUserObtainOutdatedCertifiableBadge({ userId, refDate, dataToFill }) {
  const oneDayBefore = dayjs(refDate).subtract(1, 'day').toDate();
  const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
  dataToFill.badgeKey = 'OUTDATED_BADGE_KEY';
  dataToFill.badgeId = databaseBuilder.factory.buildBadge({
    targetProfileId,
    key: dataToFill.badgeKey,
    isCertifiable: true,
  }).id;
  databaseBuilder.factory.buildBadgeCriterion({
    scope: SCOPES.CAMPAIGN_PARTICIPATION,
    threshold: 5,
    badgeId: dataToFill.badgeId,
    cappedTubes: [],
  });
  dataToFill.campaignId = databaseBuilder.factory.buildCampaign({
    targetProfileId,
  }).id;
  databaseBuilder.factory.buildCampaignSkill({ campaignId: dataToFill.campaignId, skillId: 'skill1_competenceG' });
  databaseBuilder.factory.buildCampaignSkill({ campaignId: dataToFill.campaignId, skillId: 'skill2_competenceG' });
  const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
    userId,
    campaignId: dataToFill.campaignId,
    status: CampaignParticipationStatuses.SHARED,
  }).id;
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    competenceId: 'competenceG',
    skillId: 'skill1_competenceG',
    status: KnowledgeElement.StatusType.VALIDATED,
    createdAt: oneDayBefore,
  });
  databaseBuilder.factory.buildKnowledgeElement({
    userId,
    competenceId: 'competenceG',
    skillId: 'skill2_competenceG',
    status: KnowledgeElement.StatusType.VALIDATED,
    createdAt: oneDayBefore,
  });
  databaseBuilder.factory.buildBadgeAcquisition({
    badgeId: dataToFill.badgeId,
    userId,
    campaignParticipationId,
    createdAt: oneDayBefore,
  });
  dataToFill.complementaryCertificationKey = 'OUTDATED_COMPLEMENTARY_BADGE_KEY';
  dataToFill.complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
    key: dataToFill.complementaryCertificationKey,
  }).id;
  dataToFill.complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
    level: 1,
    complementaryCertificationId: dataToFill.complementaryCertificationId,
    badgeId: dataToFill.badgeId,
    detachedAt: new Date('2021-01-01'),
  }).id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    userId,
    isPublished: true,
    isCancelled: false,
    isRejectedForFraud: false,
  }).id;
  const complementaryCertificationCourseId = databaseBuilder.factory.buildComplementaryCertificationCourse({
    complementaryCertificationId: dataToFill.complementaryCertificationId,
    certificationCourseId,
    complementaryCertificationBadgeId: dataToFill.complementaryCertificationBadgeId,
  }).id;
  databaseBuilder.factory.buildComplementaryCertificationCourseResult({
    complementaryCertificationCourseId,
    complementaryCertificationBadgeId: dataToFill.complementaryCertificationBadgeId,
    source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
    acquired: true,
  });
}
