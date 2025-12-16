import { config } from '../../config.js';
import { constants } from '../../domain/constants.js';
import { featureToggles as featureToggleService } from '../../infrastructure/feature-toggles/index.js';

const getConfig = async function () {
  const featureToggles = await featureToggleService.withTag('frontend');
  const permitPixAdminLoginFromPassword = config.authentication.permitPixAdminLoginFromPassword;
  const autonomousCoursesOrganizationId = constants.AUTONOMOUS_COURSES_ORGANIZATION_ID;

  return {
    featureToggles,
    permitPixAdminLoginFromPassword,
    autonomousCoursesOrganizationId,
  };
};

const configController = { getConfig };

export { configController };
