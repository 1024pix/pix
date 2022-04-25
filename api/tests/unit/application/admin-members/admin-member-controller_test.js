const { expect, sinon, domainBuilder } = require('../../../test-helper');

const adminMemberController = require('../../../../lib/application/admin-members/admin-member-controller');
const usecases = require('../../../../lib/domain/usecases');
const adminMemberSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/admin-member-serializer');

describe('Unit | Controller | admin-member-controller', function () {
  describe('#findAll', function () {
    it('should return the serialized admin members', async function () {
      // given
      const member = domainBuilder.buildAdminMember();
      const otherMember = domainBuilder.buildAdminMember();
      sinon.stub(usecases, 'getAdminMembers').resolves([member, otherMember]);
      const serializedMembers = Symbol('serializedMembers');
      sinon.stub(adminMemberSerializer, 'serialize').withArgs([member, otherMember]).returns(serializedMembers);

      // when
      const result = await adminMemberController.findAll();

      // then
      expect(usecases.getAdminMembers).to.have.been.calledOnce;
      expect(result).to.equal(serializedMembers);
    });
  });
});
