const { expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');
const _ = require('lodash');

describe('Acceptance | Controller | session-controller-create-certification-candidate-participation', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('#createCandidateParticipation', () => {
    let options;
    let payload;
    let userId;

    beforeEach(() => {
      userId = databaseBuilder.factory.buildUser().id;
      options = {
        method: 'POST',
        url: '/api/sessions/1/candidate-participation',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      return databaseBuilder.commit();
    });

    context('when user is not authenticated', () => {

      beforeEach(() => {
        options = {
          method: 'POST',
          url: '/api/sessions/1/candidate-participation',
          headers: { authorization: 'invalid.access.token' },
        };
      });

      it('should respond with a 401 - unauthorized access', async () => {

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });

    });

    context('when session id is not an integer', () => {

      beforeEach(() => {
        options = {
          method: 'POST',
          url: '/api/sessions/2.1/candidate-participation',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
      });

      it('should respond with a 400 - Bad Request', async () => {

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
        expect(response.result.error).to.equal('Bad Request');
      });

    });

    context('when user is authenticated', () => {
      let sessionId;

      beforeEach(() => {
        sessionId = databaseBuilder.factory.buildSession().id;
        payload = {
          data: {
            attributes: {
              'first-name': 'José',
              'last-name': 'Bové',
              'birthdate': '2000-01-01',
            },
            type: 'certification-candidates',
          }
        };
        options = {
          method: 'POST',
          url: `/api/sessions/${sessionId}/candidate-participation`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload,
        };
        return databaseBuilder.commit();
      });

      context('when no certification candidates match with the provided info', () => {

        beforeEach(() => {
          _.times(10, databaseBuilder.factory.buildCertificationCandidate({ firstName: 'Alain', userId: null, sessionId }));
          return databaseBuilder.commit();
        });

        it('should respond with a 404 not found error', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });

      });

      context('when more than one certification candidates match with the provided info', () => {

        beforeEach(() => {
          databaseBuilder.factory.buildCertificationCandidate({
            firstName: 'José', lastName: 'Bové', birthdate: '2000-01-01', sessionId, userId: null,
          });
          databaseBuilder.factory.buildCertificationCandidate({
            firstName: 'José', lastName: 'Bové', birthdate: '2000-01-01', sessionId, userId: null,
          });
          return databaseBuilder.commit();
        });

        it('should respond with a 409 conflict error', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
        });

      });

      context('when one or more personal info field is missing', () => {

        beforeEach(() => {
          payload = {
            data: {
              attributes: {
                'first-name': 'José',
                'last-name': 'Bové',
              },
              type: 'certification-candidates',
            }
          };
          options.payload = payload;
        });

        it('should respond with a 400 bad request error', async () => {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(400);
        });

      });

      context('when a unique certification candidate matches with the personal info provided', () => {

        context('when found certification candidate is not linked yet', () => {

          beforeEach(() => {
            databaseBuilder.factory.buildCertificationCandidate({
              firstName: 'José', lastName: 'Bové', birthdate: '2000-01-01', sessionId, userId: null,
            });
            return databaseBuilder.commit();
          });

          context('when user already linked to another candidate in the same session', () => {

            beforeEach(() => {
              databaseBuilder.factory.buildCertificationCandidate({
                firstName: 'Noël', lastName: 'Mamère', birthdate: '1998-06-25', sessionId, userId,
              });
              return databaseBuilder.commit();
            });

            it('should respond with 403 forbidden status code', async () => {
              // when
              const response = await server.inject(options);

              // then
              expect(response.statusCode).to.equal(403);
            });
          });

          context('when user is not linked no any candidate in the session', () => {

            it('should respond with the serialized certification candidate', async () => {
              // when
              const response = await server.inject(options);

              // then
              const actualCertificationCandidateAttributes = response.result.data.attributes;
              expect(actualCertificationCandidateAttributes['first-name']).to.equal('José');
              expect(actualCertificationCandidateAttributes['last-name']).to.equal('Bové');
              expect(actualCertificationCandidateAttributes['birthdate']).to.equal('2000-01-01');
            });

            it('should respond with 201 status code', async () => {
              // when
              const response = await server.inject(options);

              // then
              expect(response.statusCode).to.equal(201);
            });
          });
        });

        context('when found certification candidate is already linked', () => {

          context('when the candidate is linked to the same user as the requesting user', () => {

            beforeEach(() => {
              databaseBuilder.factory.buildCertificationCandidate({
                firstName: 'José', lastName: 'Bové', birthdate: '2000-01-01', sessionId, userId,
              });
              return databaseBuilder.commit();
            });

            it('should respond with the serialized certification candidate', async () => {
              // when
              const response = await server.inject(options);

              // then
              const actualCertificationCandidateAttributes = response.result.data.attributes;
              expect(actualCertificationCandidateAttributes['first-name']).to.equal('José');
              expect(actualCertificationCandidateAttributes['last-name']).to.equal('Bové');
              expect(actualCertificationCandidateAttributes['birthdate']).to.equal('2000-01-01');
            });

            it('should respond with 200 status code', async () => {
              // when
              const response = await server.inject(options);

              // then
              expect(response.statusCode).to.equal(200);
            });
          });

          context('when the candidate is linked to the another user than the requesting user', () => {

            beforeEach(() => {
              databaseBuilder.factory.buildCertificationCandidate({
                firstName: 'José', lastName: 'Bové', birthdate: '2000-01-01', sessionId,
              });
              return databaseBuilder.commit();
            });

            it('should respond with 403 forbidden', async () => {
              // when
              const response = await server.inject(options);

              // then
              expect(response.statusCode).to.equal(403);
            });
          });
        });
      });
    });
  });
});
