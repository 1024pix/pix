export default async function getAdminMembers({ adminMemberRepository }) {
  return adminMemberRepository.findAll();
}
