import { NotFoundError } from '../../../shared/domain/errors.js';
import { featureToggles } from '../../../shared/infrastructure/feature-toggles/index.js';
import { CombinedCoursesDisabledError } from '../errors.js';
import { VerifiedCode } from '../models/prescription/value-objects/VerifiedCode.js';

export const getVerifiedCode = async ({ code, campaignRepository, combinedCourseRepository }) => {
  try {
    const campaign = await campaignRepository.getByCode({ code });
    return new VerifiedCode({ code: campaign.code, type: 'campaign' });
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw error;
    }
  }
  const areCombinedCoursesEnabled = await featureToggles.get('areCombinedCoursesEnabled');
  if (!areCombinedCoursesEnabled) {
    throw new CombinedCoursesDisabledError();
  }
  const combinedCourse = await combinedCourseRepository.getByCode({ code });
  return new VerifiedCode({ code: combinedCourse.code, type: 'combined-course' });
};
