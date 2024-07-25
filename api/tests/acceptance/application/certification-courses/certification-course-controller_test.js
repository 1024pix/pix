import { CertificationIssueReportCategory } from '../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import {
  CERTIFICATION_VERSIONS,
  CertificationVersion,
} from '../../../../src/certification/shared/domain/models/CertificationVersion.js';
import { ComplementaryCertificationCourseResult } from '../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { AutoJuryCommentKeys } from '../../../../src/certification/shared/domain/models/JuryComment.js';
import { config } from '../../../../src/shared/config.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
  knex,
  learningContentBuilder,
  mockLearningContent,
} from '../../../test-helper.js';

describe('Acceptance | API | Certification Course', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/certifications/{id}', function () {
    it('should return 200 HTTP status code along with serialized certification', async function () {
      // given
      databaseBuilder.factory.buildUser({ id: 789 });
      databaseBuilder.factory.buildSession({ id: 456 });
      databaseBuilder.factory.buildCertificationCourse({
        id: 123,
        sessionId: 456,
        userId: 789,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthplace: 'Torreilles',
        birthdate: '2000-08-30',
        birthINSEECode: '66212',
        birthPostalCode: null,
        birthCountry: 'France',
        sex: 'F',
        isPublished: true,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-02-01'),
      });

      const pixBoxeComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        name: 'Pix+ Boxe',
        hasExternalJury: true,
      }).id;
      databaseBuilder.factory.buildTargetProfile({ id: 1212 });
      databaseBuilder.factory.buildBadge({
        id: 456,
        key: 'PIX_BOXE_1',
        targetProfileId: 1212,
      });
      databaseBuilder.factory.buildBadge({
        id: 457,
        key: 'PIX_BOXE_2',
        targetProfileId: 1212,
      });
      databaseBuilder.factory.buildBadge({
        id: 458,
        key: 'PIX_BOXE_3',
        targetProfileId: 1212,
      });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 777,
        badgeId: 456,
        complementaryCertificationId: pixBoxeComplementaryCertificationId,
        label: 'Pix Boxe 1',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 778,
        badgeId: 457,
        complementaryCertificationId: pixBoxeComplementaryCertificationId,
        label: 'Pix Boxe 2',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 779,
        badgeId: 458,
        complementaryCertificationId: pixBoxeComplementaryCertificationId,
        label: 'Pix Boxe 3',
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 654,
        certificationCourseId: 123,
        complementaryCertificationId: pixBoxeComplementaryCertificationId,
        complementaryCertificationBadgeId: 778,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        id: 987,
        acquired: true,
        complementaryCertificationCourseId: 654,
        complementaryCertificationBadgeId: 778,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        id: 986,
        acquired: false,
        complementaryCertificationCourseId: 654,
        complementaryCertificationBadgeId: 778,
        source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
      });
      databaseBuilder.factory.buildAssessment({ id: 159, certificationCourseId: 123 });
      databaseBuilder.factory.buildUser({ id: 66 });
      databaseBuilder.factory.buildAssessmentResult.last({
        certificationCourseId: 123,
        id: 456,
        assessmentId: 159,
        pixScore: 55,
        juryId: 66,
        commentByAutoJury: AutoJuryCommentKeys.FRAUD,
        commentByJury: 'comment jury',
        status: 'rejected',
      });
      databaseBuilder.factory.buildCompetenceMark({
        id: 125,
        score: 10,
        level: 4,
        competence_code: '2.4',
        area_code: '3',
        competenceId: 'recComp25',
        assessmentResultId: 456,
      });
      const user = await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();
      const options = {
        method: 'GET',
        url: '/api/admin/certifications/123',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(user.id),
        },
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal({
        type: 'certifications',
        id: '123',
        attributes: {
          'session-id': 456,
          'user-id': 789,
          'assessment-id': 159,
          'first-name': 'Buffy',
          'last-name': 'Summers',
          birthdate: '2000-08-30',
          birthplace: 'Torreilles',
          sex: 'F',
          'birth-insee-code': '66212',
          'birth-postal-code': null,
          'birth-country': 'France',
          status: 'rejected',
          'is-cancelled': false,
          'is-published': true,
          'is-rejected-for-fraud': false,
          'created-at': new Date('2020-01-01'),
          'completed-at': new Date('2020-02-01'),
          'pix-score': 55,
          'jury-id': 66,
          'comment-for-candidate':
            "Les conditions de passation du test de certification n'ayant pas été respectées et ayant fait l'objet d'un signalement pour fraude, votre certification a été invalidée en conséquence.",
          'comment-by-jury': 'comment jury',
          'comment-for-organization':
            'Une situation de fraude a été détectée : après analyse, nous avons statué sur un rejet de la certification.',
          version: 2,
          'competences-with-mark': [
            {
              area_code: '3',
              assessmentResultId: 456,
              competenceId: 'recComp25',
              competence_code: '2.4',
              id: 125,
              level: 4,
              score: 10,
            },
          ],
        },
        relationships: {
          'certification-issue-reports': {
            data: [],
          },
          'common-complementary-certification-course-result': {
            data: null,
          },
          'complementary-certification-course-result-with-external': {
            data: {
              id: '654',
              type: 'complementaryCertificationCourseResultWithExternals',
            },
          },
        },
      });
      expect(response.result.included).to.deep.equal([
        {
          id: '654',
          type: 'complementaryCertificationCourseResultWithExternals',
          attributes: {
            'allowed-external-levels': [
              {
                label: 'Pix Boxe 1',
                value: 777,
              },
              {
                label: 'Pix Boxe 2',
                value: 778,
              },
              {
                label: 'Pix Boxe 3',
                value: 779,
              },
            ],
            'default-jury-options': ['REJECTED', 'UNSET'],
            'complementary-certification-course-id': 654,
            'external-result': 'Rejetée',
            'final-result': 'Rejetée',
            'pix-result': 'Pix Boxe 2',
          },
        },
      ]);
    });
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
