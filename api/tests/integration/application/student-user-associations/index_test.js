const { expect, sinon } = require('../../../test-helper');
const Hapi = require('hapi');
const studentUserAssociationController = require('../../../../lib/application/student-user-associations/student-user-association-controller');

describe('Integration | Application | Route | student-user-associations', () => {
  let server;

  beforeEach(() => {
    sinon.stub(studentUserAssociationController, 'associate').callsFake((request, h) => h.response('ok').code(201));
    server = Hapi.server();
    return server.register(require('../../../../lib/application/student-user-associations'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('POST /api/student-user-associations', () => {

    it('should exist', () => {
      // when
      const promise = server.inject({
        method: 'POST',
        url: '/api/student-user-associations',
      });

      // then
      return promise.then((res) => {
        expect(res.statusCode).to.equal(201);
      });

    });

  });
});
