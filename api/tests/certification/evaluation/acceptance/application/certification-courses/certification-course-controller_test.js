import { createServer } from '../../../../../../server.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationIssueReportCategory } from '../../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { buildLearningContent as learningContentBuilder } from '../../../../../tooling/learning-content-builder/index.js';
import {
  generateAuthenticatedUserRequestHeaders,
  generateInjectOptions,
} from '../../../../../tooling/test-utils/http-server.js';

describe('Acceptance | API | Certification Course', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/certification-courses/{id}', function () {
    let options;
    let userId;
    let otherUserId;
    let expectedCertificationCourse;

    beforeEach(function () {
      otherUserId = databaseBuilder.factory.buildUser().id;
      userId = databaseBuilder.factory.buildUser().id;
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
        id: 99,
      });
      const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });

      const reconciledAt = new Date('2025-01-01');
      const candidateId = databaseBuilder.factory.buildCertificationCandidate({
        userId,
        sessionId: session.id,
        reconciledAt,
      }).id;

      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidateId });

      const versionId = databaseBuilder.factory.buildCertificationVersion({
        startDate: new Date('2024-01-01'),
        expirationDate: null,
      }).id;

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
        userId,
        version: AlgorithmEngineVersion.V3,
        versionId,
      });

      databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId: certificationCourse.id,
        category: CertificationIssueReportCategory.OTHER,
        description: "il s'est enfuit de la session",
      });

      const assessment = databaseBuilder.factory.buildAssessment({ certificationCourseId: certificationCourse.id });

      options = {
        method: 'GET',
        url: `/api/certification-courses/${certificationCourse.id}`,
        headers: {},
      };

      expectedCertificationCourse = {
        type: 'certification-courses',
        id: certificationCourse.id.toString(),
        attributes: {
          'examiner-comment': "il s'est enfuit de la session",
          'nb-challenges': 32,
          'first-name': certificationCourse.firstName,
          'last-name': certificationCourse.lastName,
          'is-adjusted-for-accessibility': false,
          version: certificationCourse.version,
        },
        relationships: {
          assessment: {
            links: {
              related: `/api/assessments/${assessment.id}`,
            },
          },
        },
      };
      return databaseBuilder.commit();
    });

    describe('Resource access management', function () {
      it('should respond with a 403 - forbidden access - if user is not linked to the certification course', function () {
        // given
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: otherUserId });

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    it('should return the certification course', async function () {
      // given
      options.headers = generateAuthenticatedUserRequestHeaders({ userId });

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data).to.deep.equal(expectedCertificationCourse);
    });
  });

  describe('POST /api/certification-courses', function () {
    let response;
    const learningContent = [
      {
        id: 'recArea0',
        competences: [
          {
            id: 'recCompetence0',
            index: '1.1',
            tubes: [
              {
                id: 'recTube0_0',
                skills: [
                  {
                    id: 'recSkill0_0',
                    nom: '@recSkill0_0',
                    challenges: [{ id: 'recChallenge0_0_0' }],
                    level: 0,
                  },
                  {
                    id: 'recSkill0_1',
                    nom: '@recSkill0_1',
                    challenges: [{ id: 'recChallenge0_1_0' }],
                    level: 1,
                  },
                  {
                    id: 'recSkill0_2',
                    nom: '@recSkill0_2',
                    challenges: [{ id: 'recChallenge0_2_0' }],
                    level: 2,
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence1',
            tubes: [
              {
                id: 'recTube1_0',
                skills: [
                  {
                    id: 'recSkill1_0',
                    nom: '@recSkill1_0',
                    challenges: [{ id: 'recChallenge1_0_0' }],
                    level: 0,
                  },
                  {
                    id: 'recSkill1_1',
                    nom: '@recSkill1_1',
                    challenges: [{ id: 'recChallenge1_1_0' }],
                    level: 1,
                  },
                  {
                    id: 'recSkill1_2',
                    nom: '@recSkill1_2',
                    challenges: [{ id: 'recChallenge1_2_0' }],
                    level: 2,
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence2',
            tubes: [
              {
                id: 'recTube2_0',
                skills: [
                  {
                    id: 'recSkill2_0',
                    nom: '@recSkill2_0',
                    challenges: [{ id: 'recChallenge2_0_0' }],
                    level: 0,
                  },
                  {
                    id: 'recSkill2_1',
                    nom: '@recSkill2_1',
                    challenges: [{ id: 'recChallenge2_1_0' }],
                    level: 1,
                  },
                  {
                    id: 'recSkill2_2',
                    nom: '@recSkill2_2',
                    challenges: [{ id: 'recChallenge2_2_0' }],
                    level: 2,
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence3',
            tubes: [
              {
                id: 'recTube3_0',
                skills: [
                  {
                    id: 'recSkill3_0',
                    nom: '@recSkill3_0',
                    challenges: [{ id: 'recChallenge3_0_0' }],
                    level: 0,
                  },
                  {
                    id: 'recSkill3_1',
                    nom: '@recSkill3_1',
                    challenges: [{ id: 'recChallenge3_1_0' }],
                    level: 1,
                  },
                  {
                    id: 'recSkill3_2',
                    nom: '@recSkill3_2',
                    challenges: [{ id: 'recChallenge3_2_0' }],
                    level: 2,
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence4',
            tubes: [
              {
                id: 'recTube4_0',
                skills: [
                  {
                    id: 'recSkill4_0',
                    nom: '@recSkill4_0',
                    challenges: [{ id: 'recChallenge4_0_0' }],
                    level: 0,
                  },
                  {
                    id: 'recSkill4_1',
                    nom: '@recSkill4_1',
                    challenges: [{ id: 'recChallenge4_1_0' }],
                    level: 1,
                  },
                  {
                    id: 'recSkill4_2',
                    nom: '@recSkill4_2',
                    challenges: [{ id: 'recChallenge4_2_0' }],
                    level: 2,
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence5',
            tubes: [
              {
                id: 'recTube5_0',
                skills: [
                  {
                    id: 'recSkill5_0',
                    nom: '@recSkill5_0',
                    challenges: [
                      { id: 'recChallenge5_0_0', langues: ['Franco Français'] },
                      { id: 'recChallenge5_0_1' },
                    ],
                    level: 0,
                  },
                  {
                    id: 'recSkill5_1',
                    nom: '@recSkill5_1',
                    challenges: [{ id: 'recChallenge5_1_1', langues: ['Franco Français'] }],
                    level: 1,
                  },
                ],
              },
            ],
          },
          {
            id: 'recCompetence6',
            tubes: [
              {
                id: 'recTube6_0',
                skills: [
                  {
                    id: 'recSkill6_0',
                    nom: '@recSkill6_0',
                    challenges: [{ id: 'recChallenge6_0_0', langues: ['Anglais'] }],
                    level: 0,
                  },
                  {
                    id: 'recSkill6_1',
                    nom: '@recSkill6_1',
                    challenges: [{ id: 'recChallenge6_1_0', langues: ['Anglais'] }],
                    level: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
    ];

    context('when the certification course does not exist', function () {
      context('when locale is fr-fr', function () {
        it('should respond with 201 status code, create a v3 certification', async function () {
          // given
          const { options, userId, sessionId } = _createRequestOptions();
          const { certificationCandidate } = _createNonExistingCertifCourseSetup({
            learningContent,
            userId,
            sessionId,
          });
          await databaseBuilder.commit();

          // when
          response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
          const [certificationCourse] = await knex('certification-courses').where({ userId, sessionId });
          expect(certificationCourse.version).to.equal(AlgorithmEngineVersion.V3);
          expect(certificationCourse.lang).to.equal('fr-fr');
          expect(certificationCourse.firstName).to.equal(certificationCandidate.firstName);
          expect(certificationCourse.lastName).to.equal(certificationCandidate.lastName);
          expect(certificationCourse.birthdate).to.equal(certificationCandidate.birthdate);
          expect(response.statusCode).to.equal(201);
        });
      });
    });

    context('when the certification course already exists', function () {
      it('should respond with 200 status code and retrieve the already existing certification course', async function () {
        // given
        const { options, userId, sessionId } = _createRequestOptions({ version: AlgorithmEngineVersion.V3 });
        _createExistingCertifCourseSetup({ learningContent, userId, sessionId, version: AlgorithmEngineVersion.V3 });
        await databaseBuilder.commit();

        // when
        response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
        const [certificationCourse] = await knex('certification-courses').where({ userId, sessionId });
        expect(certificationCourse.version).to.equal(AlgorithmEngineVersion.V3);
      });
    });
  });
});

function _createRequestOptions(
  { locale = 'fr-fr', version = AlgorithmEngineVersion.V2 } = { locale: 'fr-fr', version: AlgorithmEngineVersion.V2 },
) {
  const userId = databaseBuilder.factory.buildUser().id;
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  const sessionId = databaseBuilder.factory.buildSession({ accessCode: '123', certificationCenterId, version }).id;
  const payload = {
    data: {
      attributes: {
        'access-code': '123',
        'session-id': sessionId,
      },
    },
  };
  const options = generateInjectOptions({
    method: 'POST',
    url: '/api/certification-courses',
    payload,
    locale,
    audience: 'https://app.pix.fr',
    authorizationData: { userId },
  });

  return {
    options,
    userId,
    sessionId,
  };
}

function _createNonExistingCertifCourseSetup({ learningContent, sessionId, userId }) {
  const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
  databaseBuilder.factory.learningContent.build(learningContentObjects);

  const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    userId,
    authorizedToStart: true,
    reconciledAt: new Date('2019-02-01'),
  });
  databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });

  databaseBuilder.factory.buildCertificationVersion({
    startDate: new Date('2019-01-01'),
    expirationDate: null,
  });

  databaseBuilder.factory.buildCorrectAnswersAndKnowledgeElementsForLearningContent.fromAreas({
    learningContent,
    userId,
    earnedPix: 4,
    placementDate: new Date('2019-01-01'),
  });

  // KnowledgeElement.StatusType.RESET after the reconciledAt date
  databaseBuilder.factory.buildKnowledgeElement({
    status: KnowledgeElement.StatusType.RESET,
    skillId: 'recSkill5_1',
    competenceId: 'recCompetence5',
    userId: userId,
    createdAt: new Date('2023-03-03'),
  });

  return { certificationCandidate };
}

function _createExistingCertifCourseSetup({ learningContent, userId, sessionId, version = 2, createdAt = new Date() }) {
  const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
  databaseBuilder.factory.learningContent.build(learningContentObjects);
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    userId,
    sessionId,
    version,
    createdAt,
  }).id;
  databaseBuilder.factory.buildAssessment({ userId, certificationCourseId });

  const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId, authorizedToStart: true });
  databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });

  databaseBuilder.factory.buildCertificationVersion({
    startDate: new Date('2020-01-01'),
    expirationDate: null,
  });
}
