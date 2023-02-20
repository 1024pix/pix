export default async function getFrameworks({ frameworkRepository }) {
  return frameworkRepository.list();
}
