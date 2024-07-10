import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { adminMemberController } from '../../../../../src/team/application/admin-member/admin-member.controller.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Unit | Team | Application | Controller | admin-member', function () {
  describe('#saveAdminMember', function () {
    it('should return the serialized admin member saved', async function () {
      // given
      const attributes = { email: 'green.bot@example.net', role: ROLES.SUPER_ADMIN };
      const savedAdminMember = Symbol('saved admin member');
      sinon.stub(usecases, 'saveAdminMember').withArgs(attributes).resolves(savedAdminMember);

      const serializedAdminMember = Symbol('serialized admin member');

      const adminMemberSerializerStub = { deserialize: sinon.stub(), serialize: sinon.stub() };
      adminMemberSerializerStub.deserialize.returns(attributes);
      adminMemberSerializerStub.serialize.withArgs(savedAdminMember).returns(serializedAdminMember);

      const dependencies = { adminMemberSerializer: adminMemberSerializerStub };

      // when
      const { statusCode, source } = await adminMemberController.saveAdminMember(
        { payload: { data: { attributes } } },
        hFake,
        dependencies,
      );

      // then
      expect(source).to.deep.equal(serializedAdminMember);
      expect(statusCode).to.equal(201);
    });
  });
});
