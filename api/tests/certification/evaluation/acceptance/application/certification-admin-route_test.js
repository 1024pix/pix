import { createServer } from '../../../../../server.js';
import { AlgorithmEngineVersion } from '../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Evaluation | Acceptance | Application | certification admin routes', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/admin/certification/neutralize-challenge', function () {
    it('should neutralize the challenge and return 204 when user is SUPER_ADMIN', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' });

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

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        userId: candidate.id,
        version: AlgorithmEngineVersion.V3,
        createdAt: new Date('2025-01-01'),
        candidateId: certificationCandidate.id,
      });

      const assessment = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse.id,
        userId: candidate.id,
        type: Assessment.types.CERTIFICATION,
        state: Assessment.states.STARTED,
      });

      const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessment.id,
        pixScore: 200,
      });
      databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResult.id,
      });

      const certificationChallenge = databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourse.id,
        isNeutralized: false,
        challengeId: 'recChallenge0_0_0',
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: assessment.id,
        challengeId: certificationChallenge.challengeId,
        result: AnswerStatus.KO.status,
      });

      await databaseBuilder.commit();

      const request = {
        method: 'POST',
        url: '/api/admin/certification/neutralize-challenge',
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        payload: {
          data: {
            attributes: {
              certificationCourseId: certificationCourse.id,
              challengeRecId: certificationChallenge.challengeId,
            },
          },
        },
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(204);
      const updatedChallenge = await knex('certification-challenges').where({ id: certificationChallenge.id }).first();
      expect(updatedChallenge.isNeutralized).to.be.true;
    });

    it('should rollback neutralization when the session is already published', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' });

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

      const candidate = databaseBuilder.factory.buildUser();
      const sessionId = databaseBuilder.factory.buildSession({
        date: '2020/01/01',
        time: '12:00',
        finalizedAt: new Date('2020-01-01'),
        publishedAt: new Date('2020-01-02'),
        version: AlgorithmEngineVersion.V3,
      }).id;

      const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        userId: candidate.id,
      });

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        userId: candidate.id,
        version: AlgorithmEngineVersion.V3,
        createdAt: new Date('2025-01-01'),
        isPublished: true,
        candidateId: certificationCandidate.id,
      });

      const assessment = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse.id,
        userId: candidate.id,
        type: Assessment.types.CERTIFICATION,
        state: Assessment.states.STARTED,
      });

      const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessment.id,
        pixScore: 200,
      });
      databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResult.id,
      });

      const certificationChallenge = databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourse.id,
        isNeutralized: false,
        challengeId: 'recChallenge0_0_0',
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: assessment.id,
        challengeId: certificationChallenge.challengeId,
        result: AnswerStatus.KO.status,
      });

      await databaseBuilder.commit();

      const request = {
        method: 'POST',
        url: '/api/admin/certification/neutralize-challenge',
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        payload: {
          data: {
            attributes: {
              certificationCourseId: certificationCourse.id,
              challengeRecId: certificationChallenge.challengeId,
            },
          },
        },
      };

      // when
      const response = await server.inject(request);

      // then
      const updatedChallenge = await knex('certification-challenges').where({ id: certificationChallenge.id }).first();
      expect(updatedChallenge.isNeutralized).to.be.false;
      expect(response.statusCode).to.equal(400);
      expect(response.result.errors[0].detail).to.equal('La session est déjà publiée.');
    });
  });

  describe('POST /api/admin/certification/deneutralize-challenge', function () {
    it('should deneutralize the challenge and return 204 when user is SUPER_ADMIN', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' });

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

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        userId: candidate.id,
        version: AlgorithmEngineVersion.V3,
        createdAt: new Date('2025-01-01'),
        candidateId: certificationCandidate.id,
      });

      const assessment = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse.id,
        userId: candidate.id,
        type: Assessment.types.CERTIFICATION,
        state: Assessment.states.STARTED,
      });

      const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessment.id,
        pixScore: 200,
      });
      databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResult.id,
      });

      const certificationChallenge = databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourse.id,
        isNeutralized: true,
        challengeId: 'recChallenge0_0_0',
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: assessment.id,
        challengeId: certificationChallenge.challengeId,
        result: AnswerStatus.KO.status,
      });

      await databaseBuilder.commit();

      const request = {
        method: 'POST',
        url: '/api/admin/certification/deneutralize-challenge',
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        payload: {
          data: {
            attributes: {
              certificationCourseId: certificationCourse.id,
              challengeRecId: certificationChallenge.challengeId,
            },
          },
        },
      };

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(204);
      const updatedChallenge = await knex('certification-challenges').where({ id: certificationChallenge.id }).first();
      expect(updatedChallenge.isNeutralized).to.be.false;
    });

    it('should rollback deneutralization when the session is already published', async function () {
      // given
      const user = databaseBuilder.factory.buildUser.withRole({ role: 'SUPER_ADMIN' });

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

      const candidate = databaseBuilder.factory.buildUser();
      const sessionId = databaseBuilder.factory.buildSession({
        date: '2020/01/01',
        time: '12:00',
        finalizedAt: new Date('2020-01-01'),
        publishedAt: new Date('2020-01-02'),
        version: AlgorithmEngineVersion.V3,
      }).id;

      const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
        userId: candidate.id,
      });

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        userId: candidate.id,
        version: AlgorithmEngineVersion.V3,
        createdAt: new Date('2025-01-01'),
        isPublished: true,
        candidateId: certificationCandidate.id,
      });

      const assessment = databaseBuilder.factory.buildAssessment({
        certificationCourseId: certificationCourse.id,
        userId: candidate.id,
        type: Assessment.types.CERTIFICATION,
        state: Assessment.states.STARTED,
      });

      const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessment.id,
        pixScore: 200,
      });
      databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
        certificationCourseId: certificationCourse.id,
        lastAssessmentResultId: assessmentResult.id,
      });

      const certificationChallenge = databaseBuilder.factory.buildCertificationChallenge({
        courseId: certificationCourse.id,
        isNeutralized: true,
        challengeId: 'recChallenge0_0_0',
      });

      databaseBuilder.factory.buildAnswer({
        assessmentId: assessment.id,
        challengeId: certificationChallenge.challengeId,
        result: AnswerStatus.KO.status,
      });

      await databaseBuilder.commit();

      const request = {
        method: 'POST',
        url: '/api/admin/certification/deneutralize-challenge',
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
        payload: {
          data: {
            attributes: {
              certificationCourseId: certificationCourse.id,
              challengeRecId: certificationChallenge.challengeId,
            },
          },
        },
      };

      // when
      const response = await server.inject(request);

      // then
      const updatedChallenge = await knex('certification-challenges').where({ id: certificationChallenge.id }).first();
      expect(updatedChallenge.isNeutralized).to.be.true;
      expect(response.statusCode).to.equal(400);
      expect(response.result.errors[0].detail).to.equal('La session est déjà publiée.');
    });
  });
});
