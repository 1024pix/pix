const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/student-dependent-users');

const usecases = require('../../../../lib/domain/usecases');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Application | Student-dependent-users | student-dependent-user-controller', () => {

  let sandbox;
  let httpTestServer;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'createAndAssociateUserToStudent').rejects(new Error('not expected error'));
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#createAndAssociateUserToStudent', () => {

    const payload = { data: { attributes: {} } };
    const campaignCode = 'CODE';

    beforeEach(() => {
      payload.data.attributes = {
        'first-name': 'Robert',
        'last-name': 'Smith',
        'birthdate': '2012-12-12',
        'campaign-code': campaignCode,
        'password': 'P@ssw0rd',
        email: undefined,
      };
    });

    context('Success cases', () => {

      const createdUser = domainBuilder.buildUser();

      context('When email is used', () => {

        payload.data.attributes.email = 'toto@example.net';

        it('should return an HTTP response with status code 201', async () => {
          // given
          usecases.createAndAssociateUserToStudent.resolves(createdUser);

          // when
          const response = await httpTestServer.request('POST', '/api/student-dependent-users', payload);

          // then
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.id).to.equal(createdUser.id.toString());
        });
      });

    });

    context('Error cases', () => {

      context('when a NotFoundError is thrown', () => {

        it('should resolve a 404 HTTP response', async () => {
          // given
          usecases.createAndAssociateUserToStudent.rejects(new NotFoundError());

          // when
          const response = await httpTestServer.request('POST', '/api/student-dependent-users', payload);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });
  });

});
