const { expect, nock, generateValidRequestAuhorizationHeader, insertUserWithRolePixMaster, cleanupUsersAndPixRolesTables } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | API | Courses', () => {

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

    it('should return all the courses from the tests referential', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const courses = response.result.data;
        expect(courses.length).to.equal(5);
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
            'Preview': 'http://development.pix.beta.gouv.fr/courses/rec_course_id/preview',
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

  describe('POST /api/courses/{id}', () => {
    let options;

    beforeEach(() => {
      options = {
        method: 'POST',
        url: '/api/courses/1234',
        headers: {}
      };

      return insertUserWithRolePixMaster();
    });

    afterEach(() => {
      return cleanupUsersAndPixRolesTables();
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

  describe('PUT /api/courses/{id}', () => {
    let options;

    beforeEach(() => {
      options = {
        method: 'PUT',
        url: '/api/courses',
        headers: {}
      };

      return insertUserWithRolePixMaster();
    });

    afterEach(() => {
      return cleanupUsersAndPixRolesTables();
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
});
