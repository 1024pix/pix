/** @param {import('./dependencies.js').Dependencies & {
 *   ids: string[]
 * }}
 */
export async function findFrameworksByIds({ ids, frameworkRepository }) {
  return frameworkRepository.findByIds(ids);
}
