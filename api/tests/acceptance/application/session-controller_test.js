const { expect, knex, generateValidRequestAuhorizationHeader, insertUserWithRolePixMaster, cleanupUsersAndPixRolesTables  } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | session-controller', () => {

  describe('GET /sessions', function() {

    afterEach(() => {
      return cleanupUsersAndPixRolesTables().then(() => knex('sessions').delete());
    });

    const options = {
      method: 'GET',
      url: '/api/sessions',
      payload: {},
    };

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return a session code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        const code = response.result;
        expect(code).to.have.lengthOf(6);
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
