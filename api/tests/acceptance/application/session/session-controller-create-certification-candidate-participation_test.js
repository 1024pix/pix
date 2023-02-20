import { expect, databaseBuilder, generateValidRequestAuthorizationHeader } from '../../../test-helper';
import createServer from '../../../../server';
import _ from 'lodash';

describe('Acceptance | Controller | session-controller-create-certification-candidate-participation', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('#createCandidateParticipation', function () {
    let options;
    let payload;
    let userId;

    beforeEach(function () {
      userId = databaseBuilder.factory.buildUser().id;
      options = {
        method: 'POST',
        url: '/api/sessions/1/candidate-participation',
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
      };
      return databaseBuilder.commit();
    });

    context('when user is not authenticated', function () {
      beforeEach(function () {
        options = {
          method: 'POST',
          url: '/api/sessions/1/candidate-participation',
          headers: { authorization: 'invalid.access.token' },
        };
      });

      it('should respond with a 401 - unauthorized access', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });

    context('when session id is not an integer', function () {
      beforeEach(function () {
        options = {
          method: 'POST',
          url: '/api/sessions/2.1/candidate-participation',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
      });

      it('should respond with a 400 - Bad Request', async function () {
        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(400);
        expect(response.result.errors[0].title).to.equal('Bad Request');
      });
    });

    context('when user is authenticated', function () {
      let sessionId;

      beforeEach(function () {
        databaseBuilder.factory.buildOrganization({ type: 'SCO', isManagingStudents: false, externalId: '123456' });
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
          type: 'SCO',
          externalId: '123456',
        }).id;
        sessionId = databaseBuilder.factory.buildSession({ certificationCenterId }).id;
        payload = {
          data: {
            attributes: {
              'first-name': 'José',
              'last-name': 'Bové',
              birthdate: '2000-01-01',
            },
            type: 'certification-candidates',
          },
        };
        options = {
          method: 'POST',
          url: `/api/sessions/${sessionId}/candidate-participation`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload,
        };
        return databaseBuilder.commit();
      });

      context('when no certification candidates match with the provided info', function () {
        beforeEach(function () {
          _.times(
            10,
            databaseBuilder.factory.buildCertificationCandidate({ firstName: 'Alain', userId: null, sessionId })
          );
          return databaseBuilder.commit();
        });

        it('should respond with a 404 not found error', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when more than one certification candidates match with the provided info', function () {
        beforeEach(function () {
          databaseBuilder.factory.buildCertificationCandidate({
            firstName: 'José',
            lastName: 'Bové',
            birthdate: '2000-01-01',
            sessionId,
            userId: null,
          });
          databaseBuilder.factory.buildCertificationCandidate({
            firstName: 'José',
            lastName: 'Bové',
            birthdate: '2000-01-01',
            sessionId,
            userId: null,
          });
          return databaseBuilder.commit();
        });

        it('should respond with a 409 conflict error', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(409);
        });
      });

      context('when one or more personal info field is missing', function () {
        beforeEach(function () {
          payload = {
            data: {
              attributes: {
                'first-name': 'José',
                'last-name': 'Bové',
              },
              type: 'certification-candidates',
            },
          };
          options.payload = payload;
        });

        it('should respond with a 400 bad request error', async function () {
          // when
          const response = await server.inject(options);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });

      context('when a unique certification candidate matches with the personal info provided', function () {
        context('when found certification candidate is not linked yet', function () {
          beforeEach(function () {
            databaseBuilder.factory.buildCertificationCandidate({
              firstName: 'José',
              lastName: 'Bové',
              birthdate: '2000-01-01',
              sessionId,
              userId: null,
            });
            return databaseBuilder.commit();
          });

          context('when user already linked to another candidate in the same session', function () {
            beforeEach(function () {
              databaseBuilder.factory.buildCertificationCandidate({
                firstName: 'Noël',
                lastName: 'Mamère',
                birthdate: '1998-06-25',
                sessionId,
                userId,
              });
              return databaseBuilder.commit();
            });

            it('should respond with 403 forbidden status code', async function () {
              // when
              const response = await server.inject(options);

              // then
              expect(response.statusCode).to.equal(403);
            });
          });

          context('when user is not linked no any candidate in the session', function () {
            it('should respond with the serialized certification candidate', async function () {
              // when
              const response = await server.inject(options);

              // then
              const actualCertificationCandidateAttributes = response.result.data.attributes;
              expect(actualCertificationCandidateAttributes['first-name']).to.equal('José');
              expect(actualCertificationCandidateAttributes['last-name']).to.equal('Bové');
              expect(actualCertificationCandidateAttributes['birthdate']).to.equal('2000-01-01');
            });

            it('should respond with 201 status code', async function () {
              // when
              const response = await server.inject(options);

              // then
              expect(response.statusCode).to.equal(201);
            });
          });
        });

        context('when found certification candidate is already linked', function () {
          context('when the candidate is linked to the same user as the requesting user', function () {
            beforeEach(function () {
              databaseBuilder.factory.buildCertificationCandidate({
                firstName: 'José',
                lastName: 'Bové',
                birthdate: '2000-01-01',
                sessionId,
                userId,
              });
              return databaseBuilder.commit();
            });

            it('should respond with the serialized certification candidate', async function () {
              // when
              const response = await server.inject(options);

              // then
              const actualCertificationCandidateAttributes = response.result.data.attributes;
              expect(actualCertificationCandidateAttributes['first-name']).to.equal('José');
              expect(actualCertificationCandidateAttributes['last-name']).to.equal('Bové');
              expect(actualCertificationCandidateAttributes['birthdate']).to.equal('2000-01-01');
            });

            it('should respond with 200 status code', async function () {
              // when
              const response = await server.inject(options);

              // then
              expect(response.statusCode).to.equal(200);
            });
          });

          context('when the candidate is linked to the another user than the requesting user', function () {
            beforeEach(function () {
              databaseBuilder.factory.buildCertificationCandidate({
                firstName: 'José',
                lastName: 'Bové',
                birthdate: '2000-01-01',
                sessionId,
              });
              return databaseBuilder.commit();
            });

            it('should respond with 403 forbidden', async function () {
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
