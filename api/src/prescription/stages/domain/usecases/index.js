import * as getMasteryPercentageService from '../../../../evaluation/domain/services/get-mastery-percentage-service.js';
import * as campaignRepository from '../../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as campaignParticipationRepository from '../../../../prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import knowledgeElementForParticipationService from '../../../../prescription/shared/domain/services/knowledge-element-for-participation-service.js';
import * as targetProfileAdministrationRepository from '../../../../prescription/target-profile/infrastructure/repositories/target-profile-administration-repository.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as stageAcquisitionRepository from '../../infrastructure/repositories/stage-acquisition-repository.js';
import * as stageCollectionForTargetProfileRepository from '../../infrastructure/repositories/stage-collection-repository.js';
import * as stageRepository from '../../infrastructure/repositories/stage-repository.js';
import * as convertLevelStagesIntoThresholdsService from '../services/convert-level-stages-into-thresholds-service.js';
import * as getNewAcquiredStagesService from '../services/get-new-acquired-stages-service.js';

const dependencies = {
  campaignParticipationRepository,
  campaignRepository,
  convertLevelStagesIntoThresholdsService,
  getNewAcquiredStagesService,
  getMasteryPercentageService,
  knowledgeElementForParticipationService,
  skillRepository,
  stageAcquisitionRepository,
  stageCollectionForTargetProfileRepository,
  stageRepository,
  targetProfileAdministrationRepository,
};

import { copyTargetProfileStages } from './copy-target-profile-stages.js';
import { createOrUpdateStageCollection } from './create-or-update-stage-collection.js';
import { handleStageAcquisition } from './handle-stage-acquisition.js';
import { updateStage } from './update-stage.js';

const usecasesWithoutInjectedDependencies = {
  copyTargetProfileStages,
  createOrUpdateStageCollection,
  handleStageAcquisition,
  updateStage,
};

const stageUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { stageUsecases };
