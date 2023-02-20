export default function getCertificationCenterForAdmin({ id, certificationCenterForAdminRepository }) {
  return certificationCenterForAdminRepository.get(id);
}
