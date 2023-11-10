import {
  expect,
  databaseBuilder,
  knex,
  learningContentBuilder,
  mockLearningContent,
  generateValidRequestAuthorizationHeader,
  insertUserWithRoleSuperAdmin,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';
import { CertificationIssueReportCategory } from '../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import { CertificationAssessment } from '../../../../lib/domain/models/CertificationAssessment.js';
import { KnowledgeElement } from '../../../../lib/domain/models/KnowledgeElement.js';
import { ComplementaryCertificationCourseResult } from '../../../../lib/domain/models/ComplementaryCertificationCourseResult.js';
import { CertificationVersion } from '../../../../src/shared/domain/models/CertificationVersion.js';
import { config } from '../../../../lib/config.js';

describe('Acceptance | API | Certification Course', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/admin/certifications/{id}/details', function () {
    context('when certification match an existing scoring rule', function () {
      it('Should respond with a status 200', async function () {
        // given
        await insertUserWithRoleSuperAdmin();
        const options = {
          method: 'GET',
          url: '/api/admin/certifications/1234/details',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(),
          },
        };

        const learningContent = [
          {
            id: '1. Information et données',
            competences: [
              {
                id: 'competence_id',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [
                      {
                        id: 'recSkill1',
                        challenges: [{ id: 'k_challenge_id' }],
                        level: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ];

        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        mockLearningContent(learningContentObjects);

        databaseBuilder.factory.buildCertificationCourse({ id: 1234 });
        const assessmentId = databaseBuilder.factory.buildAssessment({
          certificationCourseId: 1234,
          competenceId: 'competence_id',
        }).id;
        const assessmentResultId = databaseBuilder.factory.buildAssessmentResult.last({
          assessmentId,
          certificationCourseId: 1234,
        }).id;
        databaseBuilder.factory.buildCompetenceMark({ assessmentResultId, competenceId: 'competence_id' });

        databaseBuilder.factory.buildCertificationChallenge({
          courseId: 1234,
          competenceId: 'competence_id',
          challengeId: 'k_challenge_id',
        });

        databaseBuilder.factory.buildAnswer({ challengeId: 'k_challenge_id', assessmentId });

        await databaseBuilder.commit();

        // when
        const result = await server.inject(options);

        // then
        expect(result.statusCode).to.equal(200);
      });
    });

    context('when certification does not match an existing scoring rule', function () {
      it('Should respond with a status 400', async function () {
        // given
        await insertUserWithRoleSuperAdmin();
        const options = {
          method: 'GET',
          url: '/api/admin/certifications/1234/details',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(),
          },
        };

        const challenges = [
          { id: 'k_challenge_id_1' },
          { id: 'k_challenge_id_2' },
          { id: 'k_challenge_id_3' },
          { id: 'k_challenge_id_4' },
        ];
        const learningContent = [
          {
            id: '1. Information et données',
            competences: [
              {
                id: 'competence_id',
                tubes: [
                  {
                    id: 'recTube1',
                    skills: [
                      {
                        id: 'recSkill1',
                        challenges,
                        level: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ];

        const user = databaseBuilder.factory.buildUser({});

        const learningContentObjects = learningContentBuilder.fromAreas(learningContent);
        mockLearningContent(learningContentObjects);

        databaseBuilder.factory.buildCertificationCourse({ id: 1234, userId: user.id });
        const assessmentId = databaseBuilder.factory.buildAssessment({
          certificationCourseId: 1234,
          competenceId: 'competence_id',
          state: CertificationAssessment.states.STARTED,
          userId: user.id,
        }).id;

        challenges.forEach(({ id: challengeId }) => {
          databaseBuilder.factory.buildCertificationChallenge({
            courseId: 1234,
            competenceId: 'competence_id',
            challengeId,
          });

          const answerId = databaseBuilder.factory.buildAnswer({ challengeId, assessmentId, result: 'ok' }).id;
          databaseBuilder.factory.buildKnowledgeElement({
            source: KnowledgeElement.SourceType.DIRECT,
            skillId: challengeId,
            assessmentId,
            answerId,
            userId: user.id,
            competenceId: 'competence_id',
            earnedPix: 8,
            createdAt: new Date('2019-01-01'),
          });
        });

        await databaseBuilder.commit();

        // when
        const result = await server.inject(options);

        // then
        expect(result.statusCode).to.equal(400);
      });
    });
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
      const pixDroitComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
        name: 'Pix+ Foot',
        hasExternalJury: false,
      }).id;
      databaseBuilder.factory.buildBadge({ id: 123, key: 'PIX_FOOT_1' });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 567,
        badgeId: 123,
        complementaryCertificationId: pixDroitComplementaryCertificationId,
        label: 'PIX_FOOT_1',
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 456,
        userId: 789,
        certificationCourseId: 123,
        complementaryCertificationId: pixDroitComplementaryCertificationId,
        complementaryCertificationBadgeId: 567,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        id: 789,
        partnerKey: 'PIX_FOOT_1',
        acquired: true,
        complementaryCertificationCourseId: 456,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });

      const pixEduComplementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({
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
        badgeId: 456,
        complementaryCertificationId: pixEduComplementaryCertificationId,
        label: 'Pix Boxe 1',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 789,
        badgeId: 457,
        complementaryCertificationId: pixEduComplementaryCertificationId,
        label: 'Pix Boxe 2',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        badgeId: 458,
        complementaryCertificationId: pixEduComplementaryCertificationId,
        label: 'Pix Boxe 3',
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        id: 654,
        userId: 789,
        certificationCourseId: 123,
        complementaryCertificationId: pixEduComplementaryCertificationId,
        complementaryCertificationBadgeId: 789,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        id: 987,
        partnerKey: 'PIX_BOXE_2',
        acquired: true,
        complementaryCertificationCourseId: 654,
        source: ComplementaryCertificationCourseResult.sources.PIX,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourseResult({
        id: 986,
        partnerKey: 'PIX_BOXE_2',
        acquired: false,
        complementaryCertificationCourseId: 654,
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
        commentForCandidate: 'comment candidate',
        commentForOrganization: 'comment organization',
        commentForJury: 'comment jury',
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
          'created-at': new Date('2020-01-01'),
          'completed-at': new Date('2020-02-01'),
          'pix-score': 55,
          'jury-id': 66,
          'comment-for-candidate': 'comment candidate',
          'comment-for-jury': 'comment jury',
          'comment-for-organization': 'comment organization',
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
            data: {
              id: '456',
              type: 'commonComplementaryCertificationCourseResults',
            },
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
          id: '456',
          type: 'commonComplementaryCertificationCourseResults',
          attributes: {
            label: 'PIX_FOOT_1',
            status: 'Validée',
          },
        },
        {
          id: '654',
          type: 'complementaryCertificationCourseResultWithExternals',
          attributes: {
            'allowed-external-levels': [
              {
                label: 'Pix Boxe 1',
                value: 'PIX_BOXE_1',
              },
              {
                label: 'Pix Boxe 2',
                value: 'PIX_BOXE_2',
              },
              {
                label: 'Pix Boxe 3',
                value: 'PIX_BOXE_3',
              },
            ],
            'complementary-certification-course-id': 654,
            'external-result': 'Rejetée',
            'final-result': 'Rejetée',
            'pix-result': 'Pix Boxe 2',
          },
        },
      ]);
    });
  });

  describe('PATCH /api/certification-courses/{id}', function () {
    context('When the user does not have role Super Admin', function () {
      it('should return 403 HTTP status code', async function () {
        const options = {
          headers: { authorization: generateValidRequestAuthorizationHeader() },
          method: 'PATCH',
          url: '/api/certification-courses/1',
          payload: {
            data: {},
          },
        };
        await databaseBuilder.commit();

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(403);
      });
    });

    context('When the user does have role Super Admin', function () {
      let options;
      let certificationCourseId;

      beforeEach(async function () {
        await insertUserWithRoleSuperAdmin();
        databaseBuilder.factory.buildCertificationCpfCountry({
          code: '99100',
          commonName: 'FRANCE',
          matcher: 'ACEFNR',
        });
        databaseBuilder.factory.buildCertificationCpfCity({
          name: 'CHATILLON EN MICHAILLE',
          INSEECode: '01091',
          isActualName: true,
        });
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          verificationCode: 'ABCD123',
          createdAt: new Date('2019-12-21T15:44:38Z'),
          completedAt: new Date('2017-12-21T15:48:38Z'),
          sex: 'F',
        }).id;

        options = {
          headers: { authorization: generateValidRequestAuthorizationHeader() },
          method: 'PATCH',
          url: `/api/certification-courses/${certificationCourseId}`,
          payload: {
            data: {
              type: 'certifications',
              id: certificationCourseId,
              attributes: {
                'first-name': 'Freezer',
                'last-name': 'The all mighty',
                birthplace: null,
                birthdate: '1989-10-24',
                'external-id': 'xenoverse2',
                sex: 'M',
                'birth-country': 'FRANCE',
                'birth-insee-code': '01091',
                'birth-postal-code': null,
              },
            },
          },
        };

        return databaseBuilder.commit();
      });

      it('should update the certification course', async function () {
        // when
        const response = await server.inject(options);

        // then
        const result = response.result.data;
        expect(result.attributes['first-name']).to.equal('Freezer');
        expect(result.attributes['last-name']).to.equal('The all mighty');
        expect(result.attributes['birthplace']).to.equal('CHATILLON EN MICHAILLE');
        expect(result.attributes['birthdate']).to.equal('1989-10-24');
        expect(result.attributes['sex']).to.equal('M');
        expect(result.attributes['birth-country']).to.equal('FRANCE');
        expect(result.attributes['birth-insee-code']).to.equal('01091');
        expect(result.attributes['birth-postal-code']).to.be.null;
        const { version, verificationCode } = await knex
          .select('version', 'verificationCode')
          .from('certification-courses')
          .where({ id: certificationCourseId })
          .first();
        expect(version).to.equal(2);
        expect(verificationCode).to.equal('ABCD123');
      });

      it('should return a Wrong Error Format when birthdate is false', function () {
        // given
        options.payload.data.attributes.birthdate = 'aaaaaaa';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((err) => {
          expect(err.statusCode).to.be.equal(400);
        });
      });
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
          expect(certificationCourses[0].version).to.equal(CertificationVersion.V2);
        });

        context('when the session is v3', function () {
          it('should have created a v3 certification course without any challenges', async function () {
            // given
            const { options, userId, sessionId } = _createRequestOptions({ version: CertificationVersion.V3 });
            _createNonExistingCertifCourseSetup({ learningContent, userId, sessionId });
            await databaseBuilder.commit();

            // when
            response = await server.inject(options);

            // then
            const [certificationCourse] = await knex('certification-courses').where({ userId, sessionId });
            expect(certificationCourse.version).to.equal(CertificationVersion.V3);
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
        _createExistingCertifCourseSetup({ userId, sessionId, version: CertificationVersion.V2 });
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
        expect(certificationCourse.version).to.equal(CertificationVersion.V2);
      });

      context('when the session is v3', function () {
        it('should retrieve the already existing V3 certification course', async function () {
          // given
          const { options, userId, sessionId } = _createRequestOptions({ version: CertificationVersion.V3 });
          _createExistingCertifCourseSetup({ userId, sessionId, version: CertificationVersion.V3 });
          await databaseBuilder.commit();

          // when
          await server.inject(options);

          // then
          const [certificationCourse] = await knex('certification-courses').where({ userId, sessionId });
          expect(certificationCourse.version).to.equal(CertificationVersion.V3);
        });
      });
    });
  });

  describe('POST /api/admin/certification-courses/{id}/cancel', function () {
    it('should respond with a 200', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 123 });
      const options = {
        method: 'POST',
        url: '/api/admin/certification-courses/123/cancel',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
      await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('POST /api/admin/certification-courses/{id}/uncancel', function () {
    it('should respond with a 200', async function () {
      // given
      databaseBuilder.factory.buildCertificationCourse({ id: 123 });
      const options = {
        method: 'POST',
        url: '/api/admin/certification-courses/123/uncancel',
        headers: { authorization: generateValidRequestAuthorizationHeader() },
      };
      await insertUserWithRoleSuperAdmin();
      await databaseBuilder.commit();

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});

function _createRequestOptions(
  { locale = 'fr-fr', version = CertificationVersion.V2 } = { locale: 'fr-fr', version: CertificationVersion.V2 },
) {
  const isV3Pilot = version === CertificationVersion.V3;
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
  databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId, authorizedToStart: true });
}
