const { expect, sinon, domainBuilder } = require('../../../test-helper');

const adminMemberController = require('../../../../lib/application/admin-members/admin-member-controller');
const usecases = require('../../../../lib/domain/usecases');
const adminMemberSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/admin-member-serializer');
const { ROLES } = require('../../../../lib/domain/constants').PIX_ADMIN;

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

  describe('#getCurrentAdminMember', function () {
    it('should get the current admin member', async function () {
      // given
      const request = { auth: { credentials: { userId: 1 } } };
      const adminMemberDetails = Symbol('adminMemberDetails');
      sinon.stub(usecases, 'getAdminMemberDetails').withArgs({ userId: 1 }).resolves(adminMemberDetails);
      const serializedUpdatedMember = Symbol('serializedUpdatedMember');
      sinon.stub(adminMemberSerializer, 'serialize').withArgs(adminMemberDetails).returns(serializedUpdatedMember);

      // when
      const response = await adminMemberController.getCurrentAdminMember(request);

      // then
      expect(response).to.be.equal(serializedUpdatedMember);
    });
  });

  describe('#updateAdminMember', function () {
    it('should return the serialized admin member with updated values', async function () {
      // given
      const id = 7;
      const role = ROLES.SUPPORT;

      const updatedMember = Symbol('updatedMember');
      sinon.stub(usecases, 'updateAdminMember').withArgs({ id, role }).resolves(updatedMember);

      const serializedUpdatedMember = Symbol('serializedUpdatedMember');
      sinon.stub(adminMemberSerializer, 'serialize').withArgs(updatedMember).returns(serializedUpdatedMember);

      // when
      const result = await adminMemberController.updateAdminMember({
        params: { id },
        payload: { data: { attributes: { role: ROLES.SUPPORT } } },
      });

      // then
      expect(result).to.equal(serializedUpdatedMember);
    });
  });
});
