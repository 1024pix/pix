import * as injectedUserRepository from '../../../identity-access-management/infrastructure/repositories/user.repository.js';
import { AdminMember } from '../../../shared/domain/models/AdminMember.js';
import { adminMemberRepository as injectedAdminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';
import { AlreadyExistingAdminMemberError } from '../errors.js';

const saveAdminMember = async function ({
  email,
  role,
  userRepository = injectedUserRepository,
  adminMemberRepository = injectedAdminMemberRepository,
} = {}) {
  const { id: userId, firstName, lastName } = await userRepository.getByEmail(email);

  const adminMember = await adminMemberRepository.get({ userId });

  if (!adminMember) {
    const savedAdminMember = await adminMemberRepository.save({ userId, role });
    return new AdminMember({ ...savedAdminMember, email, firstName, lastName });
  }

  if (adminMember.disabledAt) {
    const updatedAdminMember = await adminMemberRepository.update({
      id: adminMember.id,
      attributesToUpdate: { role, disabledAt: null },
    });
    return new AdminMember({ ...updatedAdminMember, email, firstName, lastName });
  }

  throw new AlreadyExistingAdminMemberError();
};

export { saveAdminMember };
