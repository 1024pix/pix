const { describe, it, after, afterEach, expect, knex } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | session-controller', function() {

  after(function(done) {
    server.stop(done);
  });

  describe('GET /sessions', function() {

    const options = {
      method: 'GET', url: '/api/sessions', payload: {}
    };

    it('should return 200 HTTP status code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => {
          expect(response.statusCode).to.equal(200);
        });
    });

    it('should return a session code', () => {
      // when
      const promise = server.inject(options);

      // then
      return promise
        .then((response) => {
          const code = response.result;
          expect(code).to.have.lengthOf(6);
        });
    });
  });

  describe('POST /sessions', () => {
    const options = {
      method: 'POST', url: '/api/sessions', payload: {
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
      }
    };

    afterEach(() => knex('sessions').delete());

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

    context('when a parameter is missing', () => {

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
        return promise
          .then((response) => {
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
        return promise
          .then((response) => {
            expect(response.result).to.deep.equal(expectedErrorRespond);
          });
      });
    });
  });
});
