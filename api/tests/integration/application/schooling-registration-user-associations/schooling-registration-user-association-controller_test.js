const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/schooling-registration-user-associations');

const usecases = require('../../../../lib/domain/usecases');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Application | Schooling-registration-user-association | schooling-registration-user-association-controller', function() {

  let sandbox;
  let httpTestServer;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'generateUsername').rejects(new Error('not expected error'));
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('#generateUsername', function() {
    const campaignCode = 'RESTRICTD';
    const payload = {
      data: {
        attributes: {
          'first-name': 'Robert',
          'last-name': 'Smith',
          birthdate: '2012-12-12',
          'campaign-code': campaignCode,
        },
      },
    };

    context('Success cases', function() {

      const student = domainBuilder.buildSchoolingRegistration();

      it('should return an HTTP response with status code 200', async function() {
        // given
        usecases.generateUsername.resolves([student]);

        // when
        const response = await httpTestServer.request('PUT', '/api/schooling-registration-user-associations/possibilities', payload);

        // then
        expect(response.statusCode).to.equal(200);
      });

    });

    context('Error cases', function() {

      context('when a NotFoundError is thrown', function() {

        it('should resolve a 404 HTTP response', async function() {
          // given
          usecases.generateUsername.rejects(new NotFoundError());

          // when
          const response = await httpTestServer.request('PUT', '/api/schooling-registration-user-associations/possibilities', payload);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });
  });
});
