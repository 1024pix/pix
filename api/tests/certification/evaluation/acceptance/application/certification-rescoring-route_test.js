import { AlgorithmEngineVersion } from '../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import {
  createServer,
  databaseBuilder,
  datamartBuilder,
  domainBuilder,
  expect,
  generateAuthenticatedUserRequestHeaders,
  knex,
} from '../../../../test-helper.js';

describe('Certification | Evaluation | Acceptance | Application |  certification rescoring', function () {
  describe('GET /api/admin/certifications/{certificationCourseId}/rescore', function () {
    let server, calibrationId;

    beforeEach(async function () {
      calibrationId = 1;

      server = await createServer();
    });

    describe('when scoring from the current framework', function () {
      it('should return 201 HTTP status code', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRole({
          role: 'SUPER_ADMIN',
        });

        databaseBuilder.factory.learningContent.buildArea({
          id: 'recArea0',
          code: '66',
          competenceIds: ['recCompetence0'],
        });
        databaseBuilder.factory.learningContent.buildCompetence({
          id: 'recCompetence0',
          name_i18n: { fr: 'Construire un flipper', en: 'Build a pinball' },
          index: '1.1',
          areaId: 'recArea0',
          skillIds: ['recSkill0_0'],
          origin: 'Pix',
        });
        databaseBuilder.factory.learningContent.buildTube({
          id: 'recTube0_0',
        });
        databaseBuilder.factory.learningContent.buildSkill({
          id: 'recSkill0_0',
          name: '@recSkill0_0',
          tubeId: 'recTube0_0',
          status: 'actif',
          level: 1,
        });
        databaseBuilder.factory.learningContent.buildChallenge({
          id: 'recChallenge0_0_0',
          competenceId: 'recCompetence0',
          skillId: 'recSkill0_0',
        });

        databaseBuilder.factory.buildCertificationVersion({
          startDate: new Date('2009-02-01'),
          expirationDate: new Date('2010-02-01'),
          challengesConfiguration: null,
          globalScoringConfiguration: null,
          competencesScoringConfiguration: null,
          minimumAnswersRequiredToValidateACertification: 1,
        });
        databaseBuilder.factory.buildCertificationVersion({
          startDate: new Date('2010-02-01'),
          expirationDate: null,
          minimumAnswersRequiredToValidateACertification: 1,
        });

        const candidate = databaseBuilder.factory.buildUser();
        const sessionId = databaseBuilder.factory.buildSession({
          date: '2020/01/01',
          time: '12:00',
          finalizedAt: new Date('2020-01-01'),
          version: AlgorithmEngineVersion.V3,
        }).id;

        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          sessionId,
          userId: candidate.id,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          userId: candidate.id,
          version: AlgorithmEngineVersion.V3,
          createdAt: new Date('2025-01-01'),
        });

        const assessment = databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourse.id,
          userId: candidate.id,
          type: Assessment.types.CERTIFICATION,
          state: Assessment.states.COMPLETED,
        });
        const certificationChallenge = databaseBuilder.factory.buildCertificationChallenge({
          courseId: certificationCourse.id,
          isNeutralized: false,
          challengeId: 'recChallenge0_0_0',
          competenceId: 'recCompetence0',
          associatedSkillName: '@recSkill0_0',
          associatedSkillId: 'recSkill0_0',
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: assessment.id,
          challengeId: certificationChallenge.challengeId,
          result: AnswerStatus.KO.status,
        });
        const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
          assessmentId: assessment.id,
          pixScore: 200,
        });
        databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
          certificationCourseId: certificationCourse.id,
          lastAssessmentResultId: assessmentResult.id,
        });
        databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: assessmentResult.id });

        await databaseBuilder.commit();

        const request = {
          method: 'POST',
          url: `/api/admin/certifications/${certificationCourse.id}/rescore`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(201);
        const descOrderedAssessmentResults = await knex('assessment-results').orderBy('createdAt', 'DESC');
        expect(descOrderedAssessmentResults).to.have.length(2);
        const [lastAssessmentResult] = descOrderedAssessmentResults;
        expect(lastAssessmentResult.pixScore).to.be.equal(48);
        expect(lastAssessmentResult.juryId).to.be.equal(user.id);
      });
    });

    describe('when scoring from an archived framework', function () {
      it('should return 201 HTTP status code', async function () {
        // given
        const user = databaseBuilder.factory.buildUser.withRole({
          role: 'SUPER_ADMIN',
        });

        databaseBuilder.factory.learningContent.buildArea({
          id: 'recArea0',
          code: '66',
          competenceIds: ['recCompetence0'],
        });
        databaseBuilder.factory.learningContent.buildCompetence({
          id: 'recCompetence0',
          name_i18n: { fr: 'Construire un flipper', en: 'Build a pinball' },
          index: '1.1',
          areaId: 'recArea0',
          skillIds: ['recSkill0_0'],
          origin: 'Pix',
        });
        databaseBuilder.factory.learningContent.buildTube({
          id: 'recTube0_0',
        });
        databaseBuilder.factory.learningContent.buildSkill({
          id: 'recSkill0_0',
          name: '@recSkill0_0',
          tubeId: 'recTube0_0',
          status: 'actif',
          level: 1,
        });
        databaseBuilder.factory.learningContent.buildChallenge({
          id: 'recChallenge0_0_0',
          competenceId: 'recCompetence0',
          skillId: 'recSkill0_0',
          alpha: null,
          delta: null,
        });

        datamartBuilder.factory.buildCalibration({
          id: calibrationId,
          scope: 'COEUR',
          status: 'VALIDATED',
        });
        datamartBuilder.factory.buildDatamartActiveCalibratedChallenge({
          calibrationId: calibrationId,
          challengeId: 'recChallenge0_0_0',
          alpha: 3.3,
          delta: 4.4,
        });

        databaseBuilder.factory.buildCertificationVersion({
          startDate: new Date('2010-02-01'),
          expirationDate: new Date('2024-02-01'),
          challengesConfiguration: domainBuilder.buildFlashAlgorithmConfiguration({
            maximumAssessmentLength: 1,
            defaultCandidateCapacity: -3,
          }),
          minimumAnswersRequiredToValidateACertification: 1,
        });

        databaseBuilder.factory.buildCertificationVersion({
          startDate: new Date('2024-02-01'),
          expirationDate: null,
          globalScoringConfiguration: null,
          competencesScoringConfiguration: null,
          minimumAnswersRequiredToValidateACertification: 1,
        });

        const candidate = databaseBuilder.factory.buildUser();
        const sessionId = databaseBuilder.factory.buildSession({
          date: '2020/01/01',
          time: '12:00',
          finalizedAt: new Date('2020-01-01'),
          version: AlgorithmEngineVersion.V3,
        }).id;

        const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          sessionId,
          userId: candidate.id,
        });
        databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId,
          userId: candidate.id,
          version: AlgorithmEngineVersion.V3,
          createdAt: new Date('2024-01-01'),
        });

        const assessment = databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourse.id,
          userId: candidate.id,
          type: Assessment.types.CERTIFICATION,
          state: Assessment.states.COMPLETED,
        });
        const certificationChallenge = databaseBuilder.factory.buildCertificationChallenge({
          courseId: certificationCourse.id,
          isNeutralized: false,
          challengeId: 'recChallenge0_0_0',
          competenceId: 'recCompetence0',
          associatedSkillName: '@recSkill0_0',
          associatedSkillId: 'recSkill0_0',
          discriminant: 3.3,
          difficulty: 4.4,
        });
        databaseBuilder.factory.buildAnswer({
          assessmentId: assessment.id,
          challengeId: certificationChallenge.challengeId,
          result: AnswerStatus.KO.status,
        });
        const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
          assessmentId: assessment.id,
          pixScore: 200,
        });
        databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
          certificationCourseId: certificationCourse.id,
          lastAssessmentResultId: assessmentResult.id,
        });
        databaseBuilder.factory.buildCompetenceMark({ assessmentResultId: assessmentResult.id });

        await databaseBuilder.commit();
        await datamartBuilder.commit();

        const request = {
          method: 'POST',
          url: `/api/admin/certifications/${certificationCourse.id}/rescore`,
          headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        };

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(201);
        const descOrderedAssessmentResults = await knex('assessment-results').orderBy('createdAt', 'DESC');
        expect(descOrderedAssessmentResults).to.have.length(2);
        const [lastAssessmentResult] = descOrderedAssessmentResults;
        expect(lastAssessmentResult.pixScore).to.be.equal(48);
        expect(lastAssessmentResult.juryId).to.be.equal(user.id);
      });
    });
  });
});
