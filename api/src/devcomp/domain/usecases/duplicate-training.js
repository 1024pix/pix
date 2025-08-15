import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import * as injectedTrainingRepository from '../../infrastructure/repositories/training-repository.js';
import * as injectedTrainingTriggerRepository from '../../infrastructure/repositories/training-trigger-repository.js';

const duplicateTraining = withTransaction(
  async ({
    trainingId,
    trainingRepository = injectedTrainingRepository,
    trainingTriggerRepository = injectedTrainingTriggerRepository,
  } = {}) => {
    const training = await trainingRepository.get({ trainingId });
    const newTraining = await trainingRepository.create({
      training: {
        ...training,
        internalTitle: `[Copie] ${training.internalTitle}`,
      },
    });
    const trainingTriggers = await trainingTriggerRepository.findByTrainingIdForAdmin({ trainingId });

    for (const trainingTrigger of trainingTriggers) {
      const triggerTubesToDuplicate = [];
      for (const area of trainingTrigger.areas) {
        for (const competence of area.competences) {
          for (const thematic of competence.thematics) {
            for (const triggerTube of thematic.triggerTubes) {
              triggerTubesToDuplicate.push(triggerTube);
            }
          }
        }
      }
      const triggerTubesForCreation = triggerTubesToDuplicate.map((triggerTube) => ({
        tubeId: triggerTube.tube.id,
        level: triggerTube.level,
      }));

      await trainingTriggerRepository.createOrUpdate({
        trainingId: newTraining.id,
        triggerTubesForCreation,
        type: trainingTrigger.type,
        threshold: trainingTrigger.threshold,
      });
    }

    return newTraining;
  },
);

export { duplicateTraining };
