import { PIX_ADMIN } from '../../../../../src/authorization/domain/constants.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { AdminMember } from '../../../../../src/shared/domain/models/AdminMember.js';
import { AlreadyExistingAdminMemberError } from '../../../../../src/team/domain/errors.js';
import { saveAdminMember } from '../../../../../src/team/domain/usecases/save-admin-member.usecase.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

const { ROLES } = PIX_ADMIN;

describe('Unit | Team | Domain | UseCase | save-admin-member', function () {
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
