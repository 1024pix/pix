/**
 * @param {object} params
 * @param {number} params.id
 * @param {string} params.comments
 * @param {VersionRepository} params.versionRepository
 */
export async function updateVersionComment({ id, comments, versionRepository }) {
  await versionRepository.updateComments({ id, comments });
}
