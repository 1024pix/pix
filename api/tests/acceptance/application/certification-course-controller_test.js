const { expect, databaseBuilder, knex, learningContentBuilder, mockLearningContent, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster } = require('../../test-helper');
const createServer = require('../../../server');

const { CertificationIssueReportCategories } = require('../../../lib/domain/models/CertificationIssueReportCategory');
const Assessment = require('../../../lib/domain/models/Assessment');

describe('Acceptance | API | Certification Course', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('when FT_IS_NEUTRALIZATION_AUTO_ENABLED toggle is enabled ', () => {

    describe('GET /api/admin/certifications/{id}/details', () => {

      it('Should respond with a status 200', async () => {

        // given
        await insertUserWithRolePixMaster();
        const options = {
          method: 'GET',
          url: '/api/admin/certifications/1234/details',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(),
          },
        };

        const learningContent = [{
          id: '1. Information et données',
          competences: [{
            id: 'competence_id',
            tubes: [{
              id: 'recTube1',
              skills: [{
                challenges: [
                  { id: 'k_challenge_id' },
                ],
              }],
            }],
          }],
        }];

        const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
        mockLearningContent(learningContentObjects);

        databaseBuilder.factory.buildCertificationCourse({ id: 1234, isV2Certification: true });
        const assessmentId = databaseBuilder.factory.buildAssessment({ certificationCourseId: 1234, competenceId: 'competence_id' }).id;
        const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({ assessmentId }).id;
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
  });

  describe('GET /api/admin/certifications/{id}', () => {
    let options;
    let certificationCourseId;

    context('when certification course has no assessment', () => {

      beforeEach(async () => {
        ({ id: certificationCourseId } = databaseBuilder.factory.buildCertificationCourse({
          createdAt: new Date('2017-12-21T15:44:38Z'),
          completedAt: new Date('2017-12-21T15:48:38Z'),
          isPublished: false,
        }));
        options = {
          method: 'GET',
          url: `/api/admin/certifications/${certificationCourseId}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(),
          },
        };
        return databaseBuilder.commit();
      });

      context('when user has no pixMaster role', () => {
        it('should return 403 HTTP status code', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when user is pixMaster', () => {

        beforeEach(async () => {
          await insertUserWithRolePixMaster();
          return databaseBuilder.commit();
        });

        it('should return 200 HTTP status code', async () => {
        // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });

        it('should return application/json', async () => {
        // when
          const response = await server.inject(options);

          // then
          const contentType = response.headers['content-type'];
          expect(contentType).to.contain('application/json');
        });

        it('should retrieve the certification total pix score and certified competences levels', async () => {
        // when
          const response = await server.inject(options);

          // then
          const result = response.result.data;
          expect(result.attributes['competences-with-mark']).to.have.lengthOf(0);
          expect(result.attributes['status']).to.equal('started');
        });

      });
    });

    context('when certification course has an assessment', () => {
      beforeEach(async () => {
        ({ id: certificationCourseId } = databaseBuilder.factory.buildCertificationCourse({
          createdAt: new Date('2017-12-21T15:44:38Z'),
          completedAt: new Date('2017-12-21T15:48:38Z'),
          isPublished: false,
        }));
        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourseId,
          state: 'completed',
          type: Assessment.types.CERTIFICATION,
        });
        const { id: assessmentResultId } = databaseBuilder.factory.buildAssessmentResult({
          level: 2,
          pixScore: 42,
          createdAt: new Date('2017-12-21T16:44:38Z'),
          status: 'validated',
          emitter: 'PIX-ALGO',
          commentForJury: 'Computed',
          assessmentId,
        });
        databaseBuilder.factory.buildCompetenceMark({
          level: 2,
          score: 20,
          area_code: 4,
          competence_code: 4.3,
          assessmentResultId,
        });
        databaseBuilder.factory.buildCompetenceMark({
          level: 4,
          score: 35,
          area_code: 2,
          competence_code: 2.1,
          assessmentResultId,
        });
        options = {
          method: 'GET',
          url: `/api/admin/certifications/${certificationCourseId}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader(),
          },
        };
        return databaseBuilder.commit();
      });

      context('when user has no pixMaster role', () => {
        it('should return 403 HTTP status code', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });

      context('when user is pixMaster', () => {
        beforeEach(async() => {
          await insertUserWithRolePixMaster();
          return databaseBuilder.commit();
        });
        it('should return 200 HTTP status code', async () => {
        // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(200);
        });

        it('should return application/json', async () => {
        // when
          const response = await server.inject(options);

          // then
          const contentType = response.headers['content-type'];
          expect(contentType).to.contain('application/json');
        });

        it('should retrieve the certification total pix score and certified competences levels', async () => {
        // given
          const expectedCreatedAt = new Date('2017-12-21T15:44:38Z');
          const expectedCompletedAt = new Date('2017-12-21T15:48:38Z');

          // when
          const response = await server.inject(options);

          // then
          const result = response.result.data;

          expect(result.attributes['pix-score']).to.equal(42);
          expect(result.attributes['created-at']).to.deep.equal(expectedCreatedAt);
          expect(result.attributes['completed-at']).to.deep.equal(expectedCompletedAt);
          expect(result.attributes['is-published']).to.not.be.ok;
          expect(result.attributes['competences-with-mark']).to.have.lengthOf(2);

          const firstCertifiedCompetence = result.attributes['competences-with-mark'][0];
          expect(firstCertifiedCompetence.level).to.equal(2);
          expect(firstCertifiedCompetence.competence_code).to.equal('4.3');

          const secondCertifiedCompetence = result.attributes['competences-with-mark'][1];
          expect(secondCertifiedCompetence.level).to.equal(4);
          expect(secondCertifiedCompetence.competence_code).to.equal('2.1');
        });

        it('should return 404 HTTP status code if certification not found', async () => {
        // given
          const options = {
            method: 'GET',
            url: '/api/admin/certifications/200',
            headers: { authorization: generateValidRequestAuthorizationHeader() },
          };

          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });

        describe('Resource access management', () => {

          it('should respond with a 401 - unauthorized access - if user is not authenticated', async () => {
          // given
            options.headers.authorization = 'invalid.access.token';

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(401);
          });

          it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', async () => {
          // given
            const nonPixMAsterUserId = 9999;
            options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMAsterUserId);

            // when
            const response = await server.inject(options);

            // then
            expect(response.statusCode).to.equal(403);
          });

        });

      });
    });

  });

  describe('PATCH /api/certification-courses/{id}', () => {

    context('When the user does not have role pixmaster', () => {
      it('should return 403 HTTP status code', async () => {
        const options = {
          headers: { authorization: generateValidRequestAuthorizationHeader() },
          method: 'PATCH',
          url: '/api/certification-courses/1', payload: {
            data: {},
          },
        };
        await databaseBuilder.commit();

        const response = await server.inject(options);
        expect(response.statusCode).to.equal(403);
      });
    });

    context('When the user does have role pixmaster', () => {
      let options;
      let certificationCourseId;

      beforeEach(async () => {
        await insertUserWithRolePixMaster();
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
          verificationCode: 'ABCD123',
          createdAt: new Date('2019-12-21T15:44:38Z'),
          completedAt: new Date('2017-12-21T15:48:38Z'),
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
                'birthplace': 'Namek',
                'birthdate': '1989-10-24',
                'external-id': 'xenoverse2',
              },
            },
          },
        };

        return databaseBuilder.commit();
      });

      it('should update the certification course', async () => {
        // when
        const response = await server.inject(options);

        // then
        const result = response.result.data;
        expect(result.attributes['first-name']).to.equal('Freezer');
        expect(result.attributes['last-name']).to.equal('The all mighty');
        expect(result.attributes['birthplace']).to.equal('Namek');
        expect(result.attributes['birthdate']).to.equal('1989-10-24');
        const { isV2Certification, verificationCode } = await knex
          .select('isV2Certification', 'verificationCode')
          .from('certification-courses')
          .where({ id: certificationCourseId })
          .first();
        expect(isV2Certification).to.be.true;
        expect(verificationCode).to.equal('ABCD123');
      });

      it('should return a Wrong Error Format when birthdate is false', () => {
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

  describe('GET /api/certification-courses/{id}', () => {

    let options;
    let userId;
    let otherUserId;
    let expectedCertificationCourse;

    beforeEach(() => {
      otherUserId = databaseBuilder.factory.buildUser().id;

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        hasSeenEndTestScreen: false,
      });
      userId = certificationCourse.userId;
      databaseBuilder.factory.buildCertificationIssueReport({
        certificationCourseId: certificationCourse.id,
        category: CertificationIssueReportCategories.OTHER,
        description: 'il s\'est enfuit de la session',
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
          'examiner-comment': 'il s\'est enfuit de la session',
          'has-seen-end-test-screen': false,
          'nb-challenges': 0,
          'first-name': certificationCourse.firstName,
          'last-name': certificationCourse.lastName,
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

    describe('Resource access management', () => {

      it('should respond with a 401 - unauthorized access - if user is not authenticated', () => {
        // given
        options.headers.authorization = 'invalid.access.token';

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });

      it('should respond with a 403 - forbidden access - if user is not linked to the certification course', () => {
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

    it('should return the certification course', async () => {
      // given
      options.headers.authorization = generateValidRequestAuthorizationHeader(userId);

      // when
      const response = await server.inject(options);

      // then
      expect(response.result.data).to.deep.equal(expectedCertificationCourse);
    });
  });

  describe('POST /api/certification-courses', () => {
    let options;
    let response;
    let userId;
    let sessionId;

    beforeEach(async () => {
      userId = databaseBuilder.factory.buildUser().id;
      sessionId = databaseBuilder.factory.buildSession({ accessCode: '123' }).id;
      const payload = {
        data: {
          attributes: {
            'access-code': '123',
            'session-id': sessionId,
          },
        },
      };
      options = {
        method: 'POST',
        url: '/api/certification-courses',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': 'fr-fr',
        },
        payload,
      };
      return databaseBuilder.commit();
    });

    context('when the given access code does not correspond to the session', () => {

      beforeEach(async () => {
        // given
        options.payload.data.attributes['access-code'] = 'wrongcode';

        // when
        response = await server.inject(options);
      });

      it('should respond with 404 status code', () => {
        // then
        expect(response.statusCode).to.equal(404);
      });
    });

    context('when the certification course does not exist', () => {
      let certificationCandidate;
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
                      challenges: [
                        { id: 'recChallenge0_0_0' },
                      ],
                    },
                    {
                      id: 'recSkill0_1',
                      nom: '@recSkill0_1',
                      challenges: [
                        { id: 'recChallenge0_1_0' },
                      ],
                    },
                    {
                      id: 'recSkill0_2',
                      nom: '@recSkill0_2',
                      challenges: [
                        { id: 'recChallenge0_2_0' },
                      ],
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
                      challenges: [
                        { id: 'recChallenge1_0_0' },
                      ],
                    },
                    {
                      id: 'recSkill1_1',
                      nom: '@recSkill1_1',
                      challenges: [
                        { id: 'recChallenge1_1_0' },
                      ],
                    },
                    {
                      id: 'recSkill1_2',
                      nom: '@recSkill1_2',
                      challenges: [
                        { id: 'recChallenge1_2_0' },
                      ],
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
                      challenges: [
                        { id: 'recChallenge2_0_0' },
                      ],
                    },
                    {
                      id: 'recSkill2_1',
                      nom: '@recSkill2_1',
                      challenges: [
                        { id: 'recChallenge2_1_0' },
                      ],
                    },
                    {
                      id: 'recSkill2_2',
                      nom: '@recSkill2_2',
                      challenges: [
                        { id: 'recChallenge2_2_0' },
                      ],
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
                      challenges: [
                        { id: 'recChallenge3_0_0' },
                      ],
                    },
                    {
                      id: 'recSkill3_1',
                      nom: '@recSkill3_1',
                      challenges: [
                        { id: 'recChallenge3_1_0' },
                      ],
                    },
                    {
                      id: 'recSkill3_2',
                      nom: '@recSkill3_2',
                      challenges: [
                        { id: 'recChallenge3_2_0' },
                      ],
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
                      challenges: [
                        { id: 'recChallenge4_0_0' },
                      ],
                    },
                    {
                      id: 'recSkill4_1',
                      nom: '@recSkill4_1',
                      challenges: [
                        { id: 'recChallenge4_1_0' },
                      ],
                    },
                    {
                      id: 'recSkill4_2',
                      nom: '@recSkill4_2',
                      challenges: [
                        { id: 'recChallenge4_2_0' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'recCompetence5',
              tubes: [{
                id: 'recTube0_0',
                skills: [
                  {
                    id: 'recSkill5_0',
                    nom: '@recSkill5_0',
                    challenges: [
                      { id: 'recChallenge5_0_0', langues: ['Franco Français'] },
                      { id: 'recChallenge5_0_1' },
                    ],
                  },
                  {
                    id: 'recSkill5_1',
                    nom: '@recSkill5_1',
                    challenges: [
                      { id: 'recChallenge5_1_1', langues: ['Franco Français'] },
                    ],
                  },
                ],
              }],
            },
            {
              id: 'recCompetence6',
              tubes: [{
                id: 'recTube0_0',
                skills: [
                  {
                    id: 'recSkill6_0',
                    nom: '@recSkill6_0',
                    challenges: [
                      { id: 'recChallenge6_0_0', langues: ['Anglais'] },
                    ],
                  },
                  {
                    id: 'recSkill6_1',
                    nom: '@recSkill6_1',
                    challenges: [
                      { id: 'recChallenge6_1_0', langues: ['Anglais'] },
                    ],
                  },
                ],
              }],
            },
          ],
        },
      ];

      context('when locale is fr-fr', () => {

        beforeEach(async () => {
          // given
          const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
          mockLearningContent(learningContentObjects);
          certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
          databaseBuilder.factory.buildCorrectAnswersAndKnowledgeElementsForLearningContent({
            learningContent,
            userId,
            earnedPix: 4,
          });

          await databaseBuilder.commit();

          // when
          response = await server.inject(options);
        });

        afterEach(async () => {
          await knex('knowledge-elements').delete();
          await knex('answers').delete();
          await knex('assessments').delete();
          await knex('certification-challenges').delete();
          await knex('certification-courses').delete();
        });

        it('should respond with 201 status code', () => {
          // then
          expect(response.statusCode).to.equal(201);
        });

        it('should have created a certification course', async () => {
          // then
          const certificationCourses = await knex('certification-courses').where({ userId, sessionId });
          expect(certificationCourses).to.have.length(1);
        });

        it('should have copied matching certification candidate info into created certification course', async () => {
          // then
          const certificationCourses = await knex('certification-courses').where({ userId, sessionId });
          expect(certificationCourses[0].firstName).to.equal(certificationCandidate.firstName);
          expect(certificationCourses[0].lastName).to.equal(certificationCandidate.lastName);
          expect(certificationCourses[0].birthdate).to.equal(certificationCandidate.birthdate);
          expect(certificationCourses[0].birthplace).to.equal(certificationCandidate.birthCity);
          expect(certificationCourses[0].externalId).to.equal(certificationCandidate.externalId);
        });

        it('should have only fr-fr challenges associated with certification-course', async () => {
          // then
          const certificationChallenges = await knex('certification-challenges');
          expect(certificationChallenges.length).to.equal(2);
          expect(certificationChallenges[0].challengeId).to.equal('recChallenge5_1_1');
          expect(certificationChallenges[1].challengeId).to.equal('recChallenge5_0_0');
        });
      });

      context('when locale is en', () => {
        beforeEach(async () => {
          // given
          const learningContentObjects = learningContentBuilder.buildLearningContent(learningContent);
          mockLearningContent(learningContentObjects);
          certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({ sessionId, userId });
          databaseBuilder.factory.buildCorrectAnswersAndKnowledgeElementsForLearningContent({
            learningContent,
            userId,
            earnedPix: 4,
          });
          options.headers['accept-language'] = 'en';

          await databaseBuilder.commit();

          // when
          response = await server.inject(options);
        });

        afterEach(async () => {
          await knex('knowledge-elements').delete();
          await knex('answers').delete();
          await knex('assessments').delete();
          await knex('certification-challenges').delete();
          await knex('certification-courses').delete();
        });

        it('should have only en challenges associated with certification-course', async () => {
          // then
          const certificationChallenges = await knex('certification-challenges');
          expect(certificationChallenges.length).to.equal(2);
          expect(certificationChallenges[0].challengeId).to.equal('recChallenge6_1_0');
          expect(certificationChallenges[1].challengeId).to.equal('recChallenge6_0_0');
        });
      });
    });

    context('when the certification course already exists', () => {
      let certificationCourseId;

      beforeEach(async () => {
        // given
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId }).id;
        databaseBuilder.factory.buildAssessment({ userId, certificationCourseId: certificationCourseId });
        await databaseBuilder.commit();

        // when
        response = await server.inject(options);
      });

      it('should respond with 200 status code', () => {
        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should retrieve the already existing certification course', async () => {
        // then
        const certificationCourses = await knex('certification-courses').where({ userId, sessionId });
        expect(certificationCourses).to.have.length(1);
        expect(certificationCourses[0].id).to.equal(certificationCourseId);
      });

    });

  });

  describe('POST /api/admin/certification-courses/{id}/cancel', () => {

    context('when user has no pixMaster role', () => {
      it('should return 403 HTTP status code', async () => {
        const options = {
          method: 'POST',
          url: '/api/admin/certification-courses/1/cancel',
          headers: { authorization: generateValidRequestAuthorizationHeader() },
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is pixMaster', () => {

      it('should respond with a 200', async () => {
        // given
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse();
        const options = {
          method: 'POST',
          url: `/api/admin/certification-courses/${certificationCourse.id}/cancel`,
          headers: { authorization: generateValidRequestAuthorizationHeader() },
        };
        await insertUserWithRolePixMaster();
        await databaseBuilder.commit();

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
