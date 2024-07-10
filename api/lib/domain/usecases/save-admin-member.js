import { AdminMember } from '../../../src/shared/domain/models/AdminMember.js';
import { AlreadyExistingAdminMemberError } from '../../../src/team/domain/errors.js';

const saveAdminMember = async function ({ email, role, userRepository, adminMemberRepository }) {
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
