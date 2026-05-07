/** @param {import('./dependencies.js').Dependencies} */
export async function getFrameworks({ frameworkRepository }) {
  return frameworkRepository.list();
}
