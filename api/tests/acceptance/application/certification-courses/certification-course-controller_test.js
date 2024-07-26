import { CertificationIssueReportCategory } from '../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import {
  CERTIFICATION_VERSIONS,
  CertificationVersion,
} from '../../../../src/certification/shared/domain/models/CertificationVersion.js';
import { config } from '../../../../src/shared/config.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../test-helper.js';

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
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
        id: 99,
      });
      const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        hasSeenEndTestScreen: false,
        sessionId: session.id,
      });
      userId = certificationCourse.userId;
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
          'has-seen-end-test-screen': false,
          'nb-challenges': 0,
          'first-name': certificationCourse.firstName,
          'last-name': certificationCourse.lastName,
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
        options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);

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
      options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data).to.deep.equal(expectedCertificationCourse);
    });
  });

  describe('POST /api/certification-courses', function () {
    let response;

    context('when the given access code does not correspond to the session', function () {
      it('should respond with 404 status code', async function () {
        // given
        const { options } = _createRequestOptions();
        await databaseBuilder.commit();
        options.payload.data.attributes['access-code'] = 'wrongcode';

        // when
        response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when the certification course does not exist', function () {
      const learningContent = [
        {
          id: 'recArea0',
          competences: [
            {
              id: 'recCompetence0',
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
                  id: 'recTube0_0',
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
                  id: 'recTube0_0',
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

      context('when locale is fr-fr', function () {
        it('should respond with 201 status code', async function () {
          // given
          const { options, userId, sessionId } = _createRequestOptions();
          _createNonExistingCertifCourseSetup({ learningContent, userId, sessionId });
          await databaseBuilder.commit();

          // when
          response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(201);
        });

        it('should have created a V2 certification course', async function () {
          // given
          const { options, userId, sessionId } = _createRequestOptions();
          _createNonExistingCertifCourseSetup({ learningContent, userId, sessionId });
          await databaseBuilder.commit();

          // when
          response = await server.inject(options);

          // then
          const certificationCourses = await knex('certification-courses').where({ userId, sessionId });
          expect(certificationCourses).to.have.length(1);
          expect(certificationCourses[0].version).to.equal(CERTIFICATION_VERSIONS.V2);
        });

        context('when the session is v3', function () {
          it('should have created a v3 certification course without any challenges', async function () {
            // given
            const { options, userId, sessionId } = _createRequestOptions({ version: CERTIFICATION_VERSIONS.V3 });
            _createNonExistingCertifCourseSetup({ learningContent, userId, sessionId });
            await databaseBuilder.commit();

            // when
            response = await server.inject(options);

            // then
            const [certificationCourse] = await knex('certification-courses').where({ userId, sessionId });
            expect(certificationCourse.version).to.equal(CERTIFICATION_VERSIONS.V3);
            expect(response.result.data.attributes).to.include({
              'nb-challenges': config.v3Certification.numberOfChallengesPerCourse,
            });
          });
        });

        it('should have copied matching certification candidate info into created certification course', async function () {
          // given
          const { options, userId, sessionId } = _createRequestOptions();
          const { certificationCandidate } = _createNonExistingCertifCourseSetup({
            learningContent,
            userId,
            sessionId,
          });
          await databaseBuilder.commit();

          // when
          await server.inject(options);

          // then
          const certificationCourses = await knex('certification-courses').where({ userId, sessionId });
          expect(certificationCourses[0].firstName).to.equal(certificationCandidate.firstName);
          expect(certificationCourses[0].lastName).to.equal(certificationCandidate.lastName);
          expect(certificationCourses[0].birthdate).to.equal(certificationCandidate.birthdate);
          expect(certificationCourses[0].birthplace).to.equal(certificationCandidate.birthCity);
          expect(certificationCourses[0].externalId).to.equal(certificationCandidate.externalId);
        });

        it('should have only fr-fr challenges associated with certification-course', async function () {
          // given
          const { options, userId, sessionId } = _createRequestOptions();
          _createNonExistingCertifCourseSetup({ learningContent, userId, sessionId });
          await databaseBuilder.commit();

          // when
          await server.inject(options);

          // then
          const certificationChallenges = await knex('certification-challenges');
          expect(certificationChallenges.length).to.equal(2);
          expect(certificationChallenges[0].challengeId).to.equal('recChallenge5_1_1');
          expect(certificationChallenges[1].challengeId).to.equal('recChallenge5_0_0');
        });
      });

      context('when locale is en', function () {
        it('should have only en challenges associated with certification-course', async function () {
          // given
          const { options, userId, sessionId } = _createRequestOptions({ locale: 'en' });
          _createNonExistingCertifCourseSetup({ learningContent, userId, sessionId });
          await databaseBuilder.commit();

          // when
          response = await server.inject(options);

          // then
          const certificationChallenges = await knex('certification-challenges');
          expect(certificationChallenges.length).to.equal(2);
          expect(certificationChallenges[0].challengeId).to.equal('recChallenge6_1_0');
          expect(certificationChallenges[1].challengeId).to.equal('recChallenge6_0_0');
        });
      });
    });

    context('when the certification course already exists', function () {
      it('should respond with 200 status code', async function () {
        // given
        const { options, userId, sessionId } = _createRequestOptions();
        _createExistingCertifCourseSetup({ userId, sessionId });
        await databaseBuilder.commit();

        // when
        response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should retrieve the already existing V2 certification course', async function () {
        // given
        const { options, userId, sessionId } = _createRequestOptions();
        _createExistingCertifCourseSetup({ userId, sessionId, version: CERTIFICATION_VERSIONS.V2 });
        await databaseBuilder.commit();

        // when
        response = await server.inject(options);

        // then
        const [certificationCourse, ...otherCertificationCourses] = await knex('certification-courses').where({
          userId,
          sessionId,
        });
        expect(otherCertificationCourses).to.have.length(0);
        expect(certificationCourse.id + '').to.equal(response.result.data.id);
        expect(certificationCourse.version).to.equal(CERTIFICATION_VERSIONS.V2);
      });

      context('when the session is v3', function () {
        it('should retrieve the already existing V3 certification course', async function () {
          // given
          const { options, userId, sessionId } = _createRequestOptions({ version: CERTIFICATION_VERSIONS.V3 });
          _createExistingCertifCourseSetup({ userId, sessionId, version: CERTIFICATION_VERSIONS.V3 });
          await databaseBuilder.commit();

          // when
          await server.inject(options);

          // then
          const [certificationCourse] = await knex('certification-courses').where({ userId, sessionId });
          expect(certificationCourse.version).to.equal(CERTIFICATION_VERSIONS.V3);
        });
      });
    });
  });
});

function _createRequestOptions(
  { locale = 'fr-fr', version = CERTIFICATION_VERSIONS.V2 } = { locale: 'fr-fr', version: CERTIFICATION_VERSIONS.V2 },
) {
  const isV3Pilot = CertificationVersion.isV3(version);
  const userId = databaseBuilder.factory.buildUser().id;
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ isV3Pilot }).id;
  const sessionId = databaseBuilder.factory.buildSession({ accessCode: '123', certificationCenterId, version }).id;
  const payload = {
    data: {
      attributes: {
        'access-code': '123',
        'session-id': sessionId,
      },
    },
  };
  const options = {
    method: 'POST',
    url: '/api/certification-courses',
    headers: {
      authorization: generateValidRequestAuthorizationHeader(userId),
      'accept-language': `${locale}`,
    },
    payload,
  };

  return {
    options,
    userId,
    sessionId,
  };
}

function _createNonExistingCertifCourseSetup({ learningContent, sessionId, userId }) {
  const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
  mockLearningContent(learningContentObjects);
  const certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    userId,
    authorizedToStart: true,
  });
  databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: certificationCandidate.id });
  databaseBuilder.factory.buildCorrectAnswersAndKnowledgeElementsForLearningContent.fromAreas({
    learningContent,
    userId,
    earnedPix: 4,
  });

  return {
    certificationCandidate,
  };
}

function _createExistingCertifCourseSetup({ userId, sessionId, version = 2 }) {
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId, version }).id;
  databaseBuilder.factory.buildAssessment({ userId, certificationCourseId });
  const candidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId, authorizedToStart: true });
  databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId: candidate.id });
}
