const { expect, nock, generateValidRequestAuthorizationHeader, airtableBuilder } = require('../../test-helper');
const createServer = require('../../../server');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | API | Courses', () => {

  let server;
  const userId = 42;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/courses/:course_id', () => {

    before(() => {
      const course = airtableBuilder.factory.buildCourse({
        'id': 'rec_course_id',
        'nom': 'A la recherche de l\'information #01',
        'description': 'Mener une recherche et une veille d\'information',
        'image': [{
          'id': 'attmP7vjRHdp5UcQA',
          'url': 'https://dl.airtable.com/x5gtLtMTpyJBg9dJov82_keyboard-824317_960_720.jpg',
          'filename': 'keyboard-824317_960_720.jpg',
          'type': 'image/jpeg',
        }],
        'epreuves': [
          'k_challenge_id',
        ],
        'preview': 'http://development.pix.fr/courses/rec_course_id/preview',
        'NbDEpreuves': 10,
        'acquis': '#ordonnancement,#source,#rechercheInfo,#moteur,#wikipedia,#syntaxe,#sponsor,#rechercheInfo,#cult1.1,#rechercheInfo',
        'createdTime': '2016-08-09T15:17:53.000Z',
      });

      airtableBuilder
        .mockList({ tableName: 'Tests' })
        .returns([course])
        .activate();

      const challenge = airtableBuilder.factory.buildChallenge({
        'id': 'k_challenge_id',
      });

      airtableBuilder
        .mockList({ tableName: 'Epreuves' })
        .returns([challenge])
        .activate();

    });

    after(() => {
      nock.cleanAll();
      return cache.flushAll();
    });

    context('when the course exists', () => {
      let options;

      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/api/courses/rec_course_id',
          headers: {
            authorization: generateValidRequestAuthorizationHeader(userId),
          },
        };
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

      it('should return the expected course', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          const course = response.result.data;
          expect(course.id).to.equal('rec_course_id');
          expect(course.attributes.name).to.equal('A la recherche de l\'information #01');
          expect(course.attributes.description).to.equal('Mener une recherche et une veille d\'information');
        });
      });

    });

    context('when the course does not exist', () => {
      let options;

      beforeEach(() => {
        options = {
          method: 'GET',
          url: '/api/courses/rec_i_dont_exist',
        };
      });

      it('should return 404 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(404);
        });
      });
    });
  });
});
