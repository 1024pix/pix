import { adminMemberController } from '../../../../lib/application/admin-members/admin-member-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Controller | admin-member-controller', function () {
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
