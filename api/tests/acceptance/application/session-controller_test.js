const { expect, knex, generateValidRequestAuhorizationHeader, insertUserWithRolePixMaster, cleanupUsersAndPixRolesTables  } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | session-controller', () => {

  describe('GET /sessions/{id}', function() {

    const session = {
      id: 1,
      certificationCenter: 'Université de dressage de loutres',
      address: 'Nice',
      room: '28D',
      examiner: 'Antoine Toutvenant',
      date: '2017-12-08',
      time: '14:30',
      description: 'ahah',
      accessCode: 'ABCD12'
    };

    beforeEach(() => {
      return knex('sessions').insert(session);
    });

    afterEach(() => {
      return cleanupUsersAndPixRolesTables().then(() => knex('sessions').delete());
    });

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject({
        method: 'GET',
        url: '/api/sessions/1',
        payload: {},
      });

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return 404 HTTP status code when session does not exist', () => {
      // when
      const promise = server.inject({
        method: 'GET',
        url: '/api/sessions/2',
        payload: {},
      });

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(404);
      });
    });
    context('when session have certification associated', () => {
      beforeEach(() => {
        return knex('certification-courses').insert({
          id: 3,
          sessionId: 1
        });
      });

      afterEach(() => {
        return knex('certification-courses').delete();
      });

      it('should return sessions information with related certification', () => {
        // when
        const promise = server.inject({
          method: 'GET',
          url: '/api/sessions/1',
          payload: {},
        });

        // then
        return promise.then((response) => {
          expect(response.result.data.attributes['access-code']).to.deep.equal(session.accessCode);
          expect(response.result.data.relationships.certifications).to.deep.equal({
            'data': [
              {
                'id': '3',
                'type': 'certifications'
              }
            ]
          });
        });
      });
    });
  });

  describe('POST /sessions', () => {

    let options;

    beforeEach(() => {
      options = {
        method: 'POST',
        url: '/api/sessions',
        payload: {
          data: {
            type: 'sessions',
            attributes: {
              'certification-center': 'Université de dressage de loutres',
              address: 'Nice',
              room: '28D',
              examiner: 'Antoine Toutvenant',
              date: '08/12/2017',
              time: '14:30',
              description: ''
            }
          }
        },
        headers: { authorization: generateValidRequestAuhorizationHeader() },
      };
      return insertUserWithRolePixMaster();
    });

    afterEach(() => {
      return cleanupUsersAndPixRolesTables().then(() => knex('sessions').delete());
    });

    it('should return an OK status after saving in database', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => {
          expect(response.statusCode).to.equal(200);
        })
        .then(() => knex('sessions').select())
        .then((sessions) => {
          expect(sessions).to.have.lengthOf(1);
        });
    });

    context('when something is wrong in the payload', () => {

      context('when address is missing', () => {

        beforeEach(() => {
          options.payload.data.attributes.address = '';
        });

        afterEach(() => {
          options.payload.data.attributes.address = 'Nice';
        });

        it('should return a Bad Request', () => {
          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(400);
          })
            .then(() => knex('sessions').select())
            .then((sessions) => {
              expect(sessions).to.have.lengthOf(0);
            });
        });

        it('should return payLoad with error description', () => {
          // given
          const expectedErrorRespond = {
            'errors': [
              {
                'detail': 'Vous n\'avez pas renseigné d\'adresse.',
                'meta': {
                  'field': 'address'
                },
                'source': {
                  'pointer': '/data/attributes/address',
                },
                'status': '400',
                'title': 'Invalid Attribute'
              }
            ]
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.result).to.deep.equal(expectedErrorRespond);
          });
        });
      });

      context('when date is missing', () => {

        beforeEach(() => {
          options.payload.data.attributes.date = '01/25/2017';
        });

        afterEach(() => {
          options.payload.data.attributes.date = '08/12/2017';
        });

        it('should return a Bad Request', () => {
          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.statusCode).to.equal(400);
          })
            .then(() => knex('sessions').select())
            .then((sessions) => {
              expect(sessions).to.have.lengthOf(0);
            });
        });

        it('should return payLoad with error description', () => {
          // given
          const expectedErrorRespond = {
            'errors': [
              {
                'detail': 'Veuillez renseigner une date de session au format (jj/mm/yyyy).',
                'meta': {
                  'field': 'date'
                },
                'source': {
                  'pointer': '/data/attributes/date',
                },
                'status': '400',
                'title': 'Invalid Attribute'
              }
            ]
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.result).to.deep.equal(expectedErrorRespond);
          });
        });
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
});
