const { expect, knex, generateValidRequestAuhorizationHeader, insertUserWithRolePixMaster, cleanupUsersAndPixRolesTables } = require('../../test-helper');
const server = require('../../../server');
const _  = require('lodash');

describe('Acceptance | API | Certification Course', () => {

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
        options.headers.authorization = generateValidRequestAuhorizationHeader(nonPixMAsterUserId);

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

    const courseId = '1';
    let options;

    beforeEach(() => {
      options = {
        method: 'GET',
        url: `/api/admin/certifications/${courseId}`,
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };
      let assessmentId;
      return insertUserWithRolePixMaster()
        .then(() => {
          return knex('assessments').insert({
            courseId: courseId,
            estimatedLevel: 0,
            pixScore: 42,
            type: 'CERTIFICATION'
          }).then(assessmentIds => {
            assessmentId = _.first(assessmentIds);
            return knex('marks').insert([
              {
                level: 2,
                score: 20,
                area_code: 4,
                competence_code: 4.3,
                assessmentId
              },
              {
                level: 4,
                score: 35,
                area_code: 2,
                competence_code: 2.1,
                assessmentId
              }
            ]);
          }).then(() => {
            return knex('certification-courses').insert({
              id: courseId,
              createdAt: '2017-12-21 15:44:38',
              completedAt: '2017-12-21T15:48:38.468Z'
            });
          });
        });
    });

    afterEach(() => {
      return cleanupUsersAndPixRolesTables()
        .then(() => {
          return Promise.all([
            knex('assessments').delete(),
            knex('marks').delete(),
            knex('certification-courses').delete()]);
        });

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
      return promise.then(response => {
        // then
        const result = response.result.data;
        expect(result.attributes['pix-score']).to.equal(42);
        expect(result.attributes['created-at']).to.equal('2017-12-21 15:44:38');
        expect(result.attributes['completed-at']).to.equal('2017-12-21T15:48:38.468Z');
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
        headers: { authorization: generateValidRequestAuhorizationHeader() },
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
        options.headers.authorization = generateValidRequestAuhorizationHeader(nonPixMAsterUserId);

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('PATCH /api/certification-courses/{id}', () => {

    const courseId = '1';

    let options;

    beforeEach(() => {
      options = {
        headers: { authorization: generateValidRequestAuhorizationHeader() },
        method: 'PATCH', url: `/api/certification-courses/${courseId}`, payload: {
          data: {
            type: 'certifications',
            id: 1,
            attributes: {
              'status': 'rejected',
              'first-name': 'Freezer',
              'last-name': 'The all mighty',
              'birthplace': 'Namek',
              'birthdate': '24/10/1989',
              'rejection-reason': 'Killed all citizens'
            }
          }
        }
      };

      return knex('certification-courses').insert(
        {
          id: courseId,
          createdAt: '2017-12-21 15:44:38',
          completedAt: '2017-12-21T15:48:38.468Z',
          firstName: 'Freezer'
        }
      );
    });

    afterEach(() => {
      return knex('certification-courses').delete();
    });

    it('should update the certification course', function() {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        // then
        const result = response.result.data;
        expect(result.attributes['status']).to.equal('rejected');
        expect(result.attributes['first-name']).to.equal('Freezer');
        expect(result.attributes['last-name']).to.equal('The all mighty');
        expect(result.attributes['birthplace']).to.equal('Namek');
        expect(result.attributes['birthdate']).to.equal('1989-10-24');
        expect(result.attributes['rejection-reason']).to.equal('Killed all citizens');
      });
    });

    it('should return a Wrong Error Format when birthdate is false', function() {
      // given
      options.payload.data.attributes.birthdate = 'aaaaaaa';

      // when
      const promise = server.inject(options);

      // then
      return promise.then((err) => {
        expect(err.statusCode).to.be.equal(400);
      });
    });

    it('should return a Invalid Attribute error when status is different from [started, completed, validated, rejected]', function() {
      // given
      options.payload.data.attributes.status = 'aaaaaaa';

      // when
      const promise = server.inject(options);

      // then
      return promise.then((err) => {
        expect(err.statusCode).to.be.equal(400);
      });
    });

  });
});
