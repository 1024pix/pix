const { expect, nock } = require('../../test-helper');
const createServer = require('../../../server');
const cache = require('../../../lib/infrastructure/caches/learning-content-cache');

describe('Acceptance | API | Demos', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/courses/:demo_id', () => {

    before(() => {
      nock.cleanAll();

      nock('https://api.airtable.com')
        .get('/v0/test-base/Tests')
        .query(true)
        .times(3)
        .reply(200, {
          records: [{
            id: 'rec_demo_id',
            fields: {
              'id persistant': 'rec_demo_id',
              'Nom': 'A la recherche de l\'information #01',
              'Description': 'Mener une recherche et une veille d\'information',
              'Image': [{
                'id': 'attmP7vjRHdp5UcQA',
                'url': 'https://dl.airtable.com/x5gtLtMTpyJBg9dJov82_keyboard-824317_960_720.jpg',
                'filename': 'keyboard-824317_960_720.jpg',
                'type': 'image/jpeg'
              }],
              'Durée': 13,
              'Épreuves.v2': [
                'k_challenge_id',
              ],
              'Ordre affichage': 2,
              'Preview': 'http://development.pix.fr/courses/rec_demo_id/preview',
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
              'id persistant': 'k_challenge_id',
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
      url: '/api/courses/rec_demo_id',
    };

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

    it('should return the expected course', async () => {
      // when
      const response = await server.inject(options);

      // then
      const course = response.result.data;
      expect(course.id).to.equal('rec_demo_id');
      expect(course.attributes.name).to.equal('A la recherche de l\'information #01');
      expect(course.attributes.description).to.equal('Mener une recherche et une veille d\'information');
    });
  });
});
