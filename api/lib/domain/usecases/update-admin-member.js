export default async function updateAdminMember({ id, role, adminMemberRepository }) {
  const attributesToUpdate = { role };
  return await adminMemberRepository.update({ id, attributesToUpdate });
}
