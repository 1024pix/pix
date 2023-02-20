export default async function getCertificationPointOfContact({ userId, certificationPointOfContactRepository }) {
  return certificationPointOfContactRepository.get(userId);
}
