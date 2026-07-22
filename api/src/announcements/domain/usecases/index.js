import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as announcementRepository from '../../infrastructure/repositories/announcement-repository.js';

const dependencies = {
  announcementRepository,
};

import { getAnnouncement } from './get-announcement.js';
import { updateAnnouncement } from './update-announcement.js';

const usecasesWithoutInjectedDependencies = {
  getAnnouncement,
  updateAnnouncement,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };
