const { expect, nock, generateValidRequestAuthorizationHeader } = require('../../test-helper');
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
      nock.cleanAll();

      nock('https://api.airtable.com')
        .get('/v0/test-base/Tests')
        .query(true)
        .times(3)
        .reply(200, {
          records: [{
            id: 'rec_course_id',
            fields: {
              id: 'rec_course_id',
              'Nom': 'A la recherche de l\'information #01',
              'Description': 'Mener une recherche et une veille d\'information',
              'Image': [{
                'id': 'attmP7vjRHdp5UcQA',
                'url': 'https://dl.airtable.com/x5gtLtMTpyJBg9dJov82_keyboard-824317_960_720.jpg',
                'filename': 'keyboard-824317_960_720.jpg',
                'type': 'image/jpeg'
              }],
              'Durée': 13,
              'Épreuves': [
                'k_challenge_id',
              ],
              'Ordre affichage': 2,
              'Preview': 'http://development.pix.fr/courses/rec_course_id/preview',
              'Nb d\'épreuves': 10,
              'Acquis': '#ordonnancement,#source,#rechercheInfo,#moteur,#wikipedia,#syntaxe,#sponsor,#rechercheInfo,#cult1.1,#rechercheInfo'
            },
            createdTime: '2016-08-09T15:17:53.000Z'
          }]
        });

      nock('https://api.airtable.com')
        .get('/v0/test-base/Epreuves')
        .query(true)
        .times(3)
        .reply(200, {
          records: [{
            id: 'k_challenge_id',
            fields: {
              id: 'k_challenge_id',
            },
          }]
        });
    });

    after(() => {
      nock.cleanAll();
      return cache.flushAll();
    });

    const options = {
      method: 'GET',
      url: '/api/courses/rec_course_id',
      headers: {
        authorization: generateValidRequestAuthorizationHeader(userId),
      },
    };

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
});
