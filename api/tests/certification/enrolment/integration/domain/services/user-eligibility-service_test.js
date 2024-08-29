import dayjs from 'dayjs';

import { LABEL_FOR_CORE } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityCalculator.js';
import { UserEligibilityList } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityList.js';
import { services } from '../../../../../../src/certification/enrolment/domain/services/index.js';
import { PIX_ORIGIN } from '../../../../../../src/shared/domain/constants.js';
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
        eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
        eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true }],
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
