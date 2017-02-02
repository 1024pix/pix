/* global describe, before, after, knex, nock, it, expect */
const server = require('../../../server');

describe('Acceptance | API | Courses', function () {

  after(function (done) {
    server.stop(done);
  });

  describe('GET /api/courses', function () {

    before(function (done) {
      nock.cleanAll();
      nock('https://api.airtable.com')
        .get('/v0/test-base/Tests')
        .query(true)
        .times(3)
        .reply(200, {
          'records': [{
            'id': 'course_1',
            'fields': {
              'Épreuves': []
            }
          }, {
            'id': 'course_2',
            'fields': {
              'Épreuves': []
            },
          }, {
            'id': 'course_3',
            'fields': {
              'Épreuves': []
            },
          }, {
            'id': 'course_4',
            'fields': {
              'Épreuves': []
            },
          }, {
            'id': 'course_5',
            'fields': {
              'Épreuves': []
            },
          }]
        });
      done();
    });

    after(function (done) {
      nock.cleanAll();
      done();
    });

    const options = { method: 'GET', url: '/api/courses' };

    it('should return 200 HTTP status code', function (done) {
      server.injectThen(options).then((response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function (done) {
      server.injectThen(options).then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should return all the courses from the tests referential', function (done) {
      server.injectThen(options).then((response) => {
        const courses = response.result.data;
        expect(courses.length).to.equal(5);
        done();
      });
    });
  });

  describe('GET /api/courses/:course_id', function () {

    before(function (done) {
      nock.cleanAll();
      nock('https://api.airtable.com')
        .get('/v0/test-base/Tests/course_id')
        .query(true)
        .times(3)
        .reply(200, {
          id: 'course_id',
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
            'Preview': 'http://development.pix.beta.gouv.fr/courses/course_id/preview',
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
      done();
    });

    after(function (done) {
      nock.cleanAll();
      done();
    });

    const options = { method: 'GET', url: '/api/courses/course_id' };

    it('should return 200 HTTP status code', function (done) {
      server.injectThen(options).then((response) => {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it('should return application/json', function (done) {
      server.injectThen(options).then((response) => {
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
        done();
      });
    });

    it('should return the expected course', function (done) {
      server.injectThen(options).then((response) => {
        const course = response.result.data;
        expect(course.id).to.equal('course_id');
        expect(course.attributes.name).to.equal('A la recherche de l\'information #01');
        expect(course.attributes.description).to.equal('Mener une recherche et une veille d\'information');
        expect(course.attributes['is-adaptive']).to.equal(true);
        done();
      });
    });
  });

});
