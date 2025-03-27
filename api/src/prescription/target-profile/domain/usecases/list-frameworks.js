export async function listFrameworks({ frameworkRepository }) {
  return frameworkRepository.list();
}
