import { NotFoundError } from '../../../shared/domain/errors.js';
import { VerifiedCode } from '../models/VerifiedCode.js';

import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';

export const getVerifiedCode = async (
  { code, campaignRepository = injectedRepositories.campaignRepository, combinedCourseRepository = injectedRepositories.combinedCourseRepository } = {},
) => {
  try {
    const campaign = await campaignRepository.getByCode({ code });
    return new VerifiedCode({ code: campaign.code, type: 'campaign' });
  } catch (error) {
    if (!(error instanceof NotFoundError)) {
      throw error;
    }
  }
  const combinedCourse = await combinedCourseRepository.getByCode({ code });
  return new VerifiedCode({ code: combinedCourse.code, type: 'combined-course' });
};
