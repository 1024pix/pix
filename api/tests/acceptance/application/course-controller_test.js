const { expect, nock } = require('../../test-helper');
const createServer = require('../../../server');

describe('Acceptance | API | Courses', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('GET /api/courses', () => {

    before(() => {
      nock.cleanAll();

      nock('https://api.airtable.com')
        .get('/v0/test-base/Tests')
        .query(true)
        .times(3)
        .reply(200, {
          'records': [{
            'id': 'course_1',
            'fields': {
              'Adaptatif ?': true,
              'Défi de la semaine ?': false,
              'Statut': 'Publié',
              'Épreuves': []
            }
          }, {
            'id': 'course_2',
            'fields': {
              'Adaptatif ?': true,
              'Défi de la semaine ?': true,
              'Statut': 'Publié',
              'Épreuves': []
            },
          }, {
            'id': 'course_3',
            'fields': {
              'Adaptatif ?': false,
              'Défi de la semaine ?': false,
              'Statut': 'Publié',
              'Épreuves': []
            },
          }, {
            'id': 'course_4',
            'fields': {
              'Adaptatif ?': false,
              'Défi de la semaine ?': false,
              'Statut': 'Proposé',
              'Épreuves': []
            },
          }, {
            'id': 'course_5',
            'fields': {
              'Adaptatif ?': false,
              'Défi de la semaine ?': true,
              'Statut': 'Proposé',
              'Épreuves': []
            },
          }]
        });
    });

    after(() => {
      nock.cleanAll();
    });

    const options = {
      method: 'GET',
      url: '/api/courses',
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

    it('should return progression courses from the tests referential', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const courses = response.result.data;
        expect(courses.map((c) => c.id)).to.have.members(['course_3']);
      });
    });
  });

  describe('GET /api/courses/:course_id', () => {

    before(() => {
      nock.cleanAll();

      nock('https://api.airtable.com')
        .get('/v0/test-base/Tests/rec_course_id')
        .query(true)
        .times(3)
        .reply(200, {
          id: 'rec_course_id',
          fields: {
            'Nom': 'A la recherche de l\'information #01',
            'Description': 'Mener une recherche et une veille d\'information',
            'Image': [{
              'id': 'attmP7vjRHdp5UcQA',
              'url': 'https://dl.airtable.com/x5gtLtMTpyJBg9dJov82_keyboard-824317_960_720.jpg',
              'filename': 'keyboard-824317_960_720.jpg',
              'type': 'image/jpeg'
            }],
            'Durée': 13,
            'Adaptatif ?': true,
            'Épreuves': [
              'k_challenge_id',
            ],
            'Ordre affichage': 2,
            'Preview': 'http://development.pix.fr/courses/rec_course_id/preview',
            'Nb d\'épreuves': 10,
            'Acquis': '#ordonnancement,#source,#rechercheInfo,#moteur,#wikipedia,#syntaxe,#sponsor,#rechercheInfo,#cult1.1,#rechercheInfo'
          },
          createdTime: '2016-08-09T15:17:53.000Z'
        });

      nock('https://api.airtable.com')
        .get('/v0/test-base/Epreuves/k_challenge_id')
        .query(true)
        .times(3)
        .reply(200, {
          id: 'k_challenge_id',
          fields: {},
        });
    });

    after(() => {
      nock.cleanAll();
    });

    const options = {
      method: 'GET',
      url: '/api/courses/rec_course_id',
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
        expect(course.attributes['is-adaptive']).to.equal(true);
      });
    });
  });
});
