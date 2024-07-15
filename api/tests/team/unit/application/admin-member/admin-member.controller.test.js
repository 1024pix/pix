import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { adminMemberController } from '../../../../../src/team/application/admin-member/admin-member.controller.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Unit | Team | Application | Controller | admin-member', function () {
  describe('#findAll', function () {
    it('should return the serialized admin members', async function () {
      // given
      const member = domainBuilder.buildAdminMember();
      const otherMember = domainBuilder.buildAdminMember();
      sinon.stub(usecases, 'getAdminMembers').resolves([member, otherMember]);
      const serializedMembers = Symbol('serializedMembers');
      const serializeStub = sinon.stub();
      serializeStub.withArgs([member, otherMember]).returns(serializedMembers);
      const request = {};
      const h = {};

      const adminMemberSerializer = { serialize: serializeStub };
      const dependencies = { adminMemberSerializer };

      // when
      const result = await adminMemberController.findAll(request, h, dependencies);

      // then
      expect(usecases.getAdminMembers).to.have.been.calledOnce;
      expect(result).to.equal(serializedMembers);
    });
  });

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
