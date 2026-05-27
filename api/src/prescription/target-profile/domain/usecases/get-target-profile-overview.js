import { TargetProfileOverview } from '../models/TargetProfileOverview.js';

/** @param {import('./index.js').Dependencies & {
 *   locale: string
 *   targetProfileId: number
 * }}
 */
const getTargetProfileOverview = async function ({
  locale,
  targetProfileId,
  targetProfileRepository,
  learningContentRepository,
}) {
  const targetProfile = await targetProfileRepository.get(targetProfileId);

  const { frameworks } = await learningContentRepository.findByTargetProfileId(targetProfileId, locale);

  return new TargetProfileOverview({ ...targetProfile, frameworks });
};

export { getTargetProfileOverview };
