import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper.js';
import { saveAdminMember } from '../../../../lib/domain/usecases/save-admin-member.js';
import { PIX_ADMIN } from '../../../../src/access/authorization/domain/constants.js';

const { ROLES } = PIX_ADMIN;

import { AlreadyExistingAdminMemberError, UserNotFoundError } from '../../../../lib/domain/errors.js';
import { AdminMember } from '../../../../lib/domain/models/AdminMember.js';

describe('Unit | UseCase | save-admin-member', function () {
  context('when admin member email is not found', function () {
    it('should throw a UserNotFound error', async function () {
      // given
      const attributes = { email: 'ice.bot@example.net', role: ROLES.SUPER_ADMIN };
      const adminMemberRepository = {};
      const userRepository = { getByEmail: sinon.stub().rejects(new UserNotFoundError()) };

      // when
      const error = await catchErr(saveAdminMember)({ ...attributes, adminMemberRepository, userRepository });

      // then
      expect(error).to.be.an.instanceOf(UserNotFoundError);
    });
  });

  context('when admin member does not exist', function () {
    it('should create an admin member', async function () {
      // given
      const attributes = { email: 'ice.bot@example.net', role: ROLES.SUPER_ADMIN };
      const user = domainBuilder.buildUser({ email: attributes.email });
      const savedAdminMember = domainBuilder.buildAdminMember({
        userId: user.id,
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        role: ROLES.SUPER_ADMIN,
        createdAt: new Date(),
      });
      const userRepository = { getByEmail: sinon.stub() };
      userRepository.getByEmail.withArgs(attributes.email).resolves(user);
      const adminMemberRepository = {
        get: sinon.stub().resolves(undefined),
        save: sinon.stub(),
      };
      adminMemberRepository.save.withArgs({ userId: user.id, role: ROLES.SUPER_ADMIN }).resolves(savedAdminMember);

      // when
      const result = await saveAdminMember({ ...attributes, adminMemberRepository, userRepository });

      // then
      expect(result).to.be.an.instanceOf(AdminMember);
    });
  });

  context('when admin member exists and is active', function () {
    it('should throw an AlreadyExistingAdminMember error', async function () {
      // given
      const attributes = { email: 'ice.bot@example.net', role: ROLES.SUPER_ADMIN };
      const user = domainBuilder.buildUser({ email: attributes.email });
      const adminMember = domainBuilder.buildAdminMember({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: ROLES.SUPER_ADMIN,
      });
      const userRepository = { getByEmail: sinon.stub() };
      userRepository.getByEmail.withArgs(attributes.email).resolves(user);
      const adminMemberRepository = { get: sinon.stub() };
      adminMemberRepository.get.withArgs({ userId: user.id }).resolves(adminMember);

      // when
      const error = await catchErr(saveAdminMember)({ ...attributes, adminMemberRepository, userRepository });

      // then
      expect(error).to.be.an.instanceOf(AlreadyExistingAdminMemberError);
    });
  });
});
