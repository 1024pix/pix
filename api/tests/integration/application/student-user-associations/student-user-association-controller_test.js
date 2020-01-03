const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/student-user-associations');

const usecases = require('../../../../lib/domain/usecases');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Application | Student-user-association | student-user-association-controller', () => {

  let sandbox;
  let httpTestServer;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'findAssociationPossibilities').rejects(new Error('not expected error'));
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#findAssociationPossibilities', () => {
    const campaignCode = 'CODE';
    const payload = {
      data: {
        attributes: {
          'first-name': 'Robert',
          'last-name': 'Smith',
          birthdate: '2012-12-12',
          'campaign-code': campaignCode,
        }
      },
    };

    context('Success cases', () => {

      const student = domainBuilder.buildStudent();

      it('should return an HTTP response with status code 204', async () => {
        // given
        usecases.findAssociationPossibilities.resolves([student]);

        // when
        const response = await httpTestServer.request('PUT', '/api/student-user-associations/possibilities', payload);

        // then
        expect(response.statusCode).to.equal(204);
      });

    });

    context('Error cases', () => {

      context('when a NotFoundError is thrown', () => {

        it('should resolve a 404 HTTP response', async () => {
          // given
          usecases.findAssociationPossibilities.rejects(new NotFoundError());

          // when
          const response = await httpTestServer.request('PUT', '/api/student-user-associations/possibilities', payload);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });
  });

});
