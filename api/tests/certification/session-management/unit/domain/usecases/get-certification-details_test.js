import { states as CertificationAssessmentStates } from '../../../../../../src/certification/session-management/domain/models/CertificationAssessment.js';
import { CertificationDetails } from '../../../../../../src/certification/session-management/domain/read-models/CertificationDetails.js';
import { getCertificationDetails } from '../../../../../../src/certification/session-management/domain/usecases/get-certification-details.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Session-management | Unit | Domain | UseCases | get-certification-details', function () {
  context('the certification assessment has been completed', function () {
    it('should return the certification details', async function () {
      // given
      const certificationAssessmentRepository = {
        getByCertificationCourseId: sinon.stub(),
      };
      const placementProfileService = {
        getPlacementProfile: sinon.stub(),
      };
      const competenceMarkRepository = {
        findByCertificationCourseId: sinon.stub(),
      };
      const certificationCandidateRepository = {
        getByCertificationCourseId: sinon.stub(),
      };

      const certificationCourseId = 1234;
      const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({
        challengeId: 'rec123',
        competenceId: 'recComp1',
        associatedSkillName: 'manger une mangue',
        isNeutralized: false,
      });
      const answer = domainBuilder.buildAnswer.ok({ challengeId: 'rec123', value: 'prout' });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId,
        certificationChallenges: [certificationChallenge],
        certificationAnswersByDate: [answer],
        state: CertificationAssessmentStates.COMPLETED,
      });

      const competenceMark = domainBuilder.buildCompetenceMark({
        competenceId: 'recComp1',
        score: 5,
        level: 1,
        competence_code: '1.1',
        area_code: '1',
      });
      const competenceMarks = [competenceMark];
      const placementProfile = domainBuilder.buildPlacementProfile.buildForCompetences({
        competencesData: [{ id: 'recComp1', index: '1.1', name: 'Manger des fruits', level: 3, score: 45 }],
      });

      const candidate = domainBuilder.certification.sessionManagement.buildCertificationCandidate({
        userId: certificationAssessment.userId,
        reconciledAt: new Date('2024-09-26'),
      });

      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId })
        .resolves(certificationAssessment);

      certificationCandidateRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId })
        .resolves(candidate);

      placementProfileService.getPlacementProfile
        .withArgs({
          userId: candidate.userId,
          limitDate: candidate.reconciledAt,
          version: certificationAssessment.version,
          allowExcessPixAndLevels: false,
        })
        .resolves(placementProfile);

      competenceMarkRepository.findByCertificationCourseId
        .withArgs({ certificationCourseId })
        .resolves(competenceMarks);

      // when
      const result = await getCertificationDetails({
        certificationCourseId,
        placementProfileService,
        competenceMarkRepository,
        certificationCandidateRepository,
        certificationAssessmentRepository,
      });

      //then
      expect(result).to.be.an.instanceof(CertificationDetails);
      expect(result).to.deep.equal({
        competencesWithMark: [
          {
            areaCode: '1',
            id: 'recComp1',
            index: '1.1',
            name: 'Manger des fruits',
            obtainedLevel: 1,
            obtainedScore: 5,
            positionedLevel: 3,
            positionedScore: 45,
          },
        ],
        createdAt: certificationAssessment.createdAt,
        completedAt: certificationAssessment.completedAt,
        id: certificationAssessment.certificationCourseId,
        listChallengesAndAnswers: [
          {
            challengeId: 'rec123',
            competence: '1.1',
            hasBeenSkippedAutomatically: false,
            isNeutralized: false,
            result: 'ok',
            skill: 'manger une mangue',
            value: 'prout',
          },
        ],
        percentageCorrectAnswers: 100,
        status: 'completed',
        totalScore: 5,
        userId: 123,
      });
    });
  });
});
