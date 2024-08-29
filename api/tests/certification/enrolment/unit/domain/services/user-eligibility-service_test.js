import { LABEL_FOR_CORE } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityCalculator.js';
import { UserEligibilityList } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityList.js';
import * as userEligibilityService from '../../../../../../src/certification/enrolment/domain/services/user-eligibility-service.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Domain | Services | UserEligibilityService', function () {
  describe('#getUserEligibilityList', function () {
    const userId = 123;
    let knowledgeElementRepository;
    let competenceRepository;
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
      dependencies = {
        userId,
        limitDate: someDate,
        knowledgeElementRepository,
        competenceRepository,
      };
    });

    it('should compute and return user eligibility list', async function () {
      // given
      knowledgeElementRepository.findUniqByUserId.resolves([]);
      competenceRepository.listPixCompetencesOnly.resolves([]);

      // when
      const userEligibilityList = await userEligibilityService.getUserEligibilityList(dependencies);

      // then
      expect(userEligibilityList).to.be.instanceOf(UserEligibilityList);
      expect(userEligibilityList.toDTO()).to.deep.equal({
        userId: 123,
        date: someDate,
        eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: false }],
        eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: false }],
      });
      expect(knowledgeElementRepository.findUniqByUserId).to.have.been.calledWith({
        userId,
        limitDate: someDate,
      });
      expect(competenceRepository.listPixCompetencesOnly).to.have.been.calledOnce;
    });
  });
});
