import { expect, sinon, domainBuilder, hFake } from '../../../test-helper.js';
import { adminMemberController } from '../../../../lib/application/admin-members/admin-member-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import * as adminMemberSerializer from '../../../../lib/infrastructure/serializers/jsonapi/admin-member-serializer.js';
import { PIX_ADMIN } from '../../../../lib/domain/constants.js';

const { ROLES } = PIX_ADMIN;

describe('Unit | Controller | admin-member-controller', function () {
  describe('#findAll', function () {
    it('should return the serialized admin members', async function () {
      // given
      const member = domainBuilder.buildAdminMember();
      const otherMember = domainBuilder.buildAdminMember();
      sinon.stub(usecases, 'getAdminMembers').resolves([member, otherMember]);
      const serializedMembers = Symbol('serializedMembers');
      const serializeStub = sinon.stub().withArgs([member, otherMember]).returns(serializedMembers);

      const adminMemberSerializer = { serialize: serializeStub };
      // when
      const result = await adminMemberController.findAll(adminMemberSerializer);

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
      sinon.stub(adminMemberSerializer, 'deserialize').returns({ role });
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

  describe('#deactivateAdminMember', function () {
    it('should return an empty reponse', async function () {
      // given
      const id = 7;

      const deactivatedMember = Symbol('deactivatedMember');
      sinon.stub(usecases, 'deactivateAdminMember').withArgs({ id }).resolves(deactivatedMember);

      const serializedDeactivatedMember = Symbol('serializedDeactivatedMember');
      sinon.stub(adminMemberSerializer, 'serialize').withArgs(deactivatedMember).returns(serializedDeactivatedMember);

      // when
      const { statusCode } = await adminMemberController.deactivateAdminMember(
        {
          params: { id },
        },
        hFake
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
      sinon.stub(adminMemberSerializer, 'deserialize').returns(attributes);
      sinon.stub(adminMemberSerializer, 'serialize').withArgs(savedAdminMember).returns(serializedAdminMember);

      // when
      const { statusCode, source } = await adminMemberController.saveAdminMember(
        { payload: { data: { attributes } } },
        hFake
      );

      // then
      expect(source).to.deep.equal(serializedAdminMember);
      expect(statusCode).to.equal(201);
    });
  });
});
