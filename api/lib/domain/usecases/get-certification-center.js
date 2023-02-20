export default function getCertificationCenter({ id, certificationCenterRepository }) {
  return certificationCenterRepository.get(id);
}
