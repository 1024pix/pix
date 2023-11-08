import { expect, sinon, domainBuilder, hFake } from '../../../test-helper.js';
import { adminMemberController } from '../../../../lib/application/admin-members/admin-member-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { PIX_ADMIN } from '../../../../src/access/authorization/domain/constants.js';

const { ROLES } = PIX_ADMIN;

describe('Unit | Controller | admin-member-controller', function () {
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

  describe('#getCurrentAdminMember', function () {
    it('should get the current admin member', async function () {
      // given
      const request = { auth: { credentials: { userId: 1 } } };
      const h = {};
      const adminMemberDetails = Symbol('adminMemberDetails');
      sinon.stub(usecases, 'getAdminMemberDetails').withArgs({ userId: 1 }).resolves(adminMemberDetails);
      const serializedUpdatedMember = Symbol('serializedUpdatedMember');
      const adminMemberSerializerStub = { serialize: sinon.stub() };
      adminMemberSerializerStub.serialize.withArgs(adminMemberDetails).returns(serializedUpdatedMember);
      const dependencies = { adminMemberSerializer: adminMemberSerializerStub };

      // when
      const response = await adminMemberController.getCurrentAdminMember(request, h, dependencies);

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
