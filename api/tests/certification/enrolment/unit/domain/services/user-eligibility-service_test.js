import { LABEL_FOR_CORE } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityCalculator.js';
import { UserEligibilityList } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityList.js';
import * as userEligibilityService from '../../../../../../src/certification/enrolment/domain/services/user-eligibility-service.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Domain | Services | UserEligibilityService', function () {
  describe('#getUserEligibilityList', function () {
    const userId = 123;
    let knowledgeElementRepository;
    let competenceRepository;
    let userEligibilityCalculatorRepository;
    let complementaryCertificationCourseRepository;
    let certificationBadgesService;
    let dependencies;
    let someDate;

    beforeEach(function () {
      someDate = new Date('1990-01-04');
      knowledgeElementRepository = {
        findUniqByUserId: sinon.stub(),
      };
      competenceRepository = {
        listPixCompetencesOnly: sinon.stub(),
      };
      userEligibilityCalculatorRepository = {
        findHowManyVersionsBehindByComplementaryCertificationBadgeId: sinon.stub(),
      };
      complementaryCertificationCourseRepository = {
        findByUserId: sinon.stub(),
      };
      certificationBadgesService = {
        findLatestBadgeAcquisitions: sinon.stub(),
      };
      dependencies = {
        userId,
        limitDate: someDate,
        knowledgeElementRepository,
        competenceRepository,
        userEligibilityCalculatorRepository,
        complementaryCertificationCourseRepository,
        certificationBadgesService,
      };
    });

    it('should compute and return user eligibility list', async function () {
      // given
      knowledgeElementRepository.findUniqByUserId.resolves([]);
      competenceRepository.listPixCompetencesOnly.resolves([]);
      const certifiableBadgeAcquisition = domainBuilder.buildCertifiableBadgeAcquisition({
        isOutdated: false,
      });
      userEligibilityCalculatorRepository.findHowManyVersionsBehindByComplementaryCertificationBadgeId.resolves({
        [certifiableBadgeAcquisition.complementaryCertificationBadgeId]: 0,
      });
      complementaryCertificationCourseRepository.findByUserId.resolves([]);
      certificationBadgesService.findLatestBadgeAcquisitions.resolves([certifiableBadgeAcquisition]);

      // when
      const userEligibilityList = await userEligibilityService.getUserEligibilityList(dependencies);

      // then
      expect(userEligibilityList).to.be.instanceOf(UserEligibilityList);
      expect(userEligibilityList.toDTO()).to.deep.equal({
        userId: 123,
        date: someDate,
        eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: false }],
        eligibilitiesV2: [
          { certification: LABEL_FOR_CORE, isCertifiable: false, isV2: true },
          {
            certification: certifiableBadgeAcquisition.complementaryCertificationKey,
            isCertifiable: false,
            isV2: true,
            complementaryCertificationBadgeId: certifiableBadgeAcquisition.complementaryCertificationBadgeId,
            complementaryCertificationId: certifiableBadgeAcquisition.complementaryCertificationId,
            campaignId: certifiableBadgeAcquisition.campaignId,
            badgeKey: certifiableBadgeAcquisition.badgeKey,
            why: { isOutdated: false, isCoreCertifiable: false },
            info: { hasComplementaryCertificationForThisLevel: false, versionsBehind: 0 },
          },
        ],
      });
      expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWith({
        userId,
        limitDate: someDate,
      });
      expect(competenceRepository.listPixCompetencesOnly).to.have.been.calledOnce;
      expect(userEligibilityCalculatorRepository.findHowManyVersionsBehindByComplementaryCertificationBadgeId).to.have
        .been.calledOnce;
      expect(complementaryCertificationCourseRepository.findByUserId).to.have.been.calledWith({
        userId,
      });
      expect(certificationBadgesService.findLatestBadgeAcquisitions).to.have.been.calledWith({
        userId,
        limitDate: someDate,
      });
    });
  });
});
