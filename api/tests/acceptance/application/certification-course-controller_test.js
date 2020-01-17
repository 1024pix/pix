const { expect, databaseBuilder, knex, airtableBuilder, generateValidRequestAuthorizationHeader, insertUserWithRolePixMaster } = require('../../test-helper');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');
const createServer = require('../../../server');

const Assessment = require('../../../lib/domain/models/Assessment');

describe('Acceptance | API | Certification Course', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/admin/certifications/{id}/details', () => {

    let options;

    beforeEach(() => {
      options = {
        method: 'GET',
        url: '/api/admin/certifications/1234/details',
        headers: {}
      };
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

      it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', () => {
        // given
        const nonPixMAsterUserId = 9999;
        options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMAsterUserId);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('GET /api/admin/certifications/{id}', () => {
    let options;
    let certificationCourseId;

    context('when certification course has no assessment', () => {

      beforeEach(async () => {
        await insertUserWithRolePixMaster();
        ({ id: certificationCourseId } = databaseBuilder.factory.buildCertificationCourse({
          createdAt: new Date('2017-12-21T15:44:38Z'),
          completedAt: new Date('2017-12-21T15:48:38Z'),
          isPublished: false,
        }));
        options = {
          method: 'GET',
          url: `/api/admin/certifications/${certificationCourseId}`,
          headers: {
            authorization: generateValidRequestAuthorizationHeader()
          }
        };
        return databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should return application/json', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const contentType = response.headers['content-type'];
          expect(contentType).to.contain('application/json');
        });
      });

      it('should retrieve the certification total pix score and certified competences levels', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          // then
          const result = response.result.data;
          expect(result.attributes['competences-with-mark']).to.have.lengthOf(0);
          expect(result.attributes['assessment-id']).to.be.null;
          expect(result.attributes['status']).to.equal('missing-assessment');
        });
      });

    });

    context('when certification course has an assessment', () => {

      beforeEach(async () => {
        await insertUserWithRolePixMaster();
        ({ id: certificationCourseId } = databaseBuilder.factory.buildCertificationCourse({
          createdAt: new Date('2017-12-21T15:44:38Z'),
          completedAt: new Date('2017-12-21T15:48:38Z'),
          isPublished: false,
        }));
        const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
          courseId: certificationCourseId.toString(),
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
            authorization: generateValidRequestAuthorizationHeader()
          }
        };
        return databaseBuilder.commit();
      });

      it('should return 200 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should return application/json', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const contentType = response.headers['content-type'];
          expect(contentType).to.contain('application/json');
        });
      });

      it('should retrieve the certification total pix score and certified competences levels', () => {
        // given
        const expectedCreatedAt = new Date('2017-12-21T15:44:38Z');
        const expectedResultCreatedAt = new Date('2017-12-21T16:44:38Z');
        const expectedCompletedAt = new Date('2017-12-21T15:48:38Z');

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          // then
          const result = response.result.data;

          expect(result.attributes['pix-score']).to.equal(42);
          expect(result.attributes['created-at']).to.deep.equal(expectedCreatedAt);
          expect(result.attributes['result-created-at']).to.deep.equal(expectedResultCreatedAt);
          expect(result.attributes['completed-at']).to.deep.equal(expectedCompletedAt);
          expect(result.attributes['is-published']).to.not.be.ok;
          expect(result.attributes['competences-with-mark']).to.have.lengthOf(2);

          const firstCertifiedCompetence = result.attributes['competences-with-mark'][0];
          expect(firstCertifiedCompetence.level).to.equal(2);
          expect(firstCertifiedCompetence['competence-code']).to.equal('4.3');

          const secondCertifiedCompetence = result.attributes['competences-with-mark'][1];
          expect(secondCertifiedCompetence.level).to.equal(4);
          expect(secondCertifiedCompetence['competence-code']).to.equal('2.1');
        });
      });

      it('should return 404 HTTP status code if certification not found', () => {
        // given
        const options = {
          method: 'GET',
          url: '/api/admin/certifications/200',
          headers: { authorization: generateValidRequestAuthorizationHeader() }
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(404);
        });
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

        it('should respond with a 403 - forbidden access - if user has not role PIX_MASTER', () => {
          // given
          const nonPixMAsterUserId = 9999;
          options.headers.authorization = generateValidRequestAuthorizationHeader(nonPixMAsterUserId);

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(403);
          });
        });

      });

    });

  });

  describe('PATCH /api/certification-courses/{id}', () => {

    let options;

    beforeEach(() => {
      const { id: certificationCourseId } = databaseBuilder.factory.buildCertificationCourse({
        createdAt: new Date('2019-12-21T15:44:38Z'),
        completedAt: new Date('2017-12-21T15:48:38Z')
      });
      options = {
        headers: { authorization: generateValidRequestAuthorizationHeader() },
        method: 'PATCH',
        url: `/api/certification-courses/${certificationCourseId}`, payload: {
          data: {
            type: 'certifications',
            id: certificationCourseId,
            attributes: {
              'first-name': 'Freezer',
              'last-name': 'The all mighty',
              'birthplace': 'Namek',
              'birthdate': '1989-10-24',
              'external-id': 'xenoverse2'
            }
          }
        }
      };

      return databaseBuilder.commit();
    });

    it('should update the certification course', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        // then
        const result = response.result.data;
        expect(result.attributes['first-name']).to.equal('Freezer');
        expect(result.attributes['last-name']).to.equal('The all mighty');
        expect(result.attributes['birthplace']).to.equal('Namek');
        expect(result.attributes['birthdate']).to.equal('1989-10-24');
        expect(result.attributes['external-id']).to.equal('xenoverse2');
      });
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

  describe('GET /api/certification-courses/{id}', () => {

    let options;
    let userId;
    let otherUserId;
    let expectedCertificationCourse;

    beforeEach(() => {
      otherUserId = databaseBuilder.factory.buildUser().id;
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse();
      const assessment = databaseBuilder.factory.buildAssessment({ courseId: certificationCourse.id });
      userId = certificationCourse.userId;
      options = {
        method: 'GET',
        url: `/api/certification-courses/${certificationCourse.id}`,
        headers: {}
      };
      expectedCertificationCourse = {
        type: 'certification-courses',
        id: certificationCourse.id.toString(),
        attributes: {
          'examiner-comment': undefined,
          'has-seen-end-test-screen': undefined,
          'nb-challenges': 0,
        },
        relationships: {
          assessment: {
            links: {
              related: `/api/assessments/${assessment.id}`,
            }
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

    beforeEach(async() => {
      userId = databaseBuilder.factory.buildUser().id;
      sessionId = databaseBuilder.factory.buildSession({ accessCode: '123' }).id;
      const payload = {
        data: {
          attributes: {
            'access-code': '123',
            'session-id': sessionId,
          }
        }
      };
      options = {
        method: 'POST',
        url: '/api/certification-courses',
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
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

      beforeEach(async () => {
        // given
        const { area, competences, skills, challenges, competencesAssociatedSkillsAndChallenges } = airtableBuilder.factory.buildCertificationPrerequisites();
        airtableBuilder.mockList({ tableName: 'Domaines' })
          .returns([area])
          .activate();
        airtableBuilder.mockList({ tableName: 'Competences' })
          .returns(competences)
          .activate();
        airtableBuilder.mockList({ tableName: 'Acquis' })
          .returns(skills)
          .activate();
        airtableBuilder.mockList({ tableName: 'Epreuves' })
          .returns(challenges)
          .activate();

        certificationCandidate = databaseBuilder.factory.buildCertificationCandidate({
          sessionId,
          userId,
        });
        const assessmentId = databaseBuilder.factory.buildAssessment({
          userId,
        }).id;
        const commonUserIdAssessmentIdAndEarnedPixForAllKEs = { userId, assessmentId, earnedPix: 4 };
        competencesAssociatedSkillsAndChallenges.forEach((element) => {
          const { challengeId, competenceId } = element;
          const answerId = databaseBuilder.factory.buildAnswer({ assessmentId, challengeId }).id;
          databaseBuilder.factory.buildKnowledgeElement({ ...commonUserIdAssessmentIdAndEarnedPixForAllKEs, competenceId, answerId });
        });
        await databaseBuilder.commit();

        // when
        response = await server.inject(options);
      });

      afterEach(async () => {
        await knex('certification-challenges').delete();
        await knex('certification-courses').delete();
        await knex('knowledge-elements').delete();
        await knex('answers').delete();
        await knex('assessments').delete();
        airtableBuilder.cleanAll();
        return cache.flushAll();
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

    });

    context('when the certification course already exists', () => {
      let certificationCourseId;

      beforeEach(async () => {
        // given
        certificationCourseId = databaseBuilder.factory.buildCertificationCourse({ userId, sessionId }).id;
        databaseBuilder.factory.buildAssessment({ userId, courseId: certificationCourseId });
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

});
