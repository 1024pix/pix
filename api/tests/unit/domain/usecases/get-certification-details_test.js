const { sinon, expect, domainBuilder } = require('../../../test-helper');
const getCertificationDetails = require('../../../../lib/domain/usecases/get-certification-details');
const CertificationDetails = require('../../../../lib/domain/read-models/CertificationDetails');
const CertificationAssessmentStates = require('../../../../lib/domain/models/CertificationAssessment').states;

describe('Unit | UseCase | get-certification-details', () => {

  const certificationAssessmentRepository = {
    getByCertificationCourseId: sinon.stub(),
  };

  const placementProfileService = {
    getPlacementProfile: sinon.stub(),
  };

  const competenceMarkRepository = {
    findByCertificationCourseId: sinon.stub(),
  };

  const certificationService = {
    calculateCertificationResultByCertificationCourseId: sinon.stub(),
  };

  context('the certification assessment has not been completed', () => {
    it('should compute the certification details on the fly', async () => {
      // given
      const certificationCourseId = 1234;
      const certificationChallenge = domainBuilder.buildCertificationChallenge({
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
        state: CertificationAssessmentStates.STARTED,
      });

      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId })
        .resolves(certificationAssessment);

      const certificationResult = {
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
        listChallengesAndAnswers: [
          {
            challengeId: 'rec123',
            competence: '1.1',
            isNeutralized: false,
            result: 'ok',
            skill: 'manger une mangue',
            value: 'prout',
          },
        ],
        percentageCorrectAnswers: 100,
        status: 'started',
        totalScore: 5,
        userId: 123,
      };

      certificationService.calculateCertificationResultByCertificationCourseId.withArgs(certificationCourseId).resolves(
        certificationResult,
      );

      // when
      const result = await getCertificationDetails({
        certificationCourseId,
        placementProfileService,
        competenceMarkRepository,
        certificationAssessmentRepository,
        certificationService,
      });

      //then
      expect(result).to.be.an.instanceof(CertificationDetails);
      expect(result).to.deep.equal({ ...certificationResult, id: certificationCourseId });
    });
  });

  context('the certification assessment has been completed', () => {
    it('should return the certification details', async () => {
      // given
      const certificationCourseId = 1234;
      const certificationChallenge = domainBuilder.buildCertificationChallenge({ challengeId: 'rec123', competenceId: 'recComp1', associatedSkillName: 'manger une mangue', isNeutralized: false });
      const answer = domainBuilder.buildAnswer.ok({ challengeId: 'rec123', value: 'prout' });

      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId,
        certificationChallenges: [certificationChallenge],
        certificationAnswersByDate: [answer],
        state: CertificationAssessmentStates.COMPLETED,
      });

      const competenceMark = domainBuilder.buildCompetenceMark({ competenceId: 'recComp1', score: 5, level: 1, competence_code: '1.1', area_code: '1' });
      const competenceMarks = [competenceMark];
      const placementProfile = domainBuilder.buildPlacementProfile.buildForCompetences({
        competencesData: [
          { id: 'recComp1', index: '1.1', name: 'Manger des fruits', level: 3, score: 45 },
        ],
      });

      certificationAssessmentRepository.getByCertificationCourseId
        .withArgs({ certificationCourseId })
        .resolves(certificationAssessment);

      placementProfileService.getPlacementProfile
        .withArgs({
          userId: certificationAssessment.userId,
          limitDate: certificationAssessment.createdAt,
          isV2Certification: certificationAssessment.isV2Certification,
        })
        .resolves(placementProfile);

      competenceMarkRepository.findByCertificationCourseId
        .withArgs(certificationCourseId)
        .resolves(competenceMarks);

      // when
      const result = await getCertificationDetails({
        certificationCourseId,
        placementProfileService,
        competenceMarkRepository,
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
