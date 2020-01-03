const { expect, sinon } = require('../../../test-helper');
const Hapi = require('@hapi/hapi');
const studentUserAssociationController = require('../../../../lib/application/student-dependent-users/student-dependent-user-controller');

describe('Integration | Application | Route | student-dependent-users', () => {
  let server;

  beforeEach(() => {
    sinon.stub(studentUserAssociationController, 'createAndAssociateUserToStudent').callsFake((request, h) => h.response('ok').code(201));
    server = Hapi.server();
    return server.register(require('../../../../lib/application/student-dependent-users'));
  });

  afterEach(() => {
    server.stop();
  });

  describe('POST /api/student-dependent-users', () => {

    it('should succeed', async () => {
      // when
      const result = await server.inject({
        method: 'POST',
        url: '/api/student-dependent-users',
        payload: { data: { attributes: {
          'first-name': 'Robert',
          'last-name': 'Smith',
          birthdate: '2012-12-12',
          'campaign-code': 'CODE',
          username: 'us3rnam3',
          password: 'P@ssw0rd',
        } } },
      });

      // then
      expect(result.statusCode).to.equal(201);
    });
  });

});
