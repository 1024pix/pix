import { adminMemberController } from '../../../../lib/application/admin-members/admin-member-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { PIX_ADMIN } from '../../../../src/authorization/domain/constants.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Unit | Controller | admin-member-controller', function () {
  describe('#updateAdminMember', function () {
    it('should return the serialized admin member with updated values', async function () {
      // given
      const id = 7;
      const role = ROLES.SUPPORT;

      const updatedMember = Symbol('updatedMember');
      sinon.stub(usecases, 'updateAdminMember').withArgs({ id, role }).resolves(updatedMember);

      const serializedUpdatedMember = Symbol('serializedUpdatedMember');
      const adminMemberSerializerStub = { deserialize: sinon.stub(), serialize: sinon.stub() };
      adminMemberSerializerStub.deserialize.returns({ role });
      adminMemberSerializerStub.serialize.withArgs(updatedMember).returns(serializedUpdatedMember);

      const dependencies = { adminMemberSerializer: adminMemberSerializerStub };
      const h = {};

      // when
      const result = await adminMemberController.updateAdminMember(
        {
          params: { id },
          payload: { data: { attributes: { role: ROLES.SUPPORT } } },
        },
        h,
        dependencies,
      );

      // then
      expect(result).to.equal(serializedUpdatedMember);
    });
  });

  describe('#deactivateAdminMember', function () {
    it('should return an empty reponse', async function () {
      // given
      const id = 7;

      const deactivatedMember = Symbol('deactivatedMember');
      sinon.stub(usecases, 'deactivateAdminMember').withArgs({ id }).resolves(deactivatedMember);

      const serializedDeactivatedMember = Symbol('serializedDeactivatedMember');
      const adminMemberSerializerStub = { serialize: sinon.stub() };
      adminMemberSerializerStub.serialize.withArgs(deactivatedMember).returns(serializedDeactivatedMember);
      const dependencies = { adminMemberSerializer: adminMemberSerializerStub };

      // when
      const { statusCode } = await adminMemberController.deactivateAdminMember(
        {
          params: { id },
        },
        hFake,
        dependencies,
      );

      // then
      expect(statusCode).to.equal(204);
    });
  });
});
