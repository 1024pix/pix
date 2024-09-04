import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

const servicesWithoutInjectedDependencies = { placementProfileService };

const services = injectDependencies(servicesWithoutInjectedDependencies);
export { services };
