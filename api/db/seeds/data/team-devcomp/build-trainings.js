import { PIX_EDU_SMALL_TARGET_PROFILE_ID } from './constants.js';

export function buildTrainings(databaseBuilder) {
  const frTrainingId = databaseBuilder.factory.buildTraining({
    title: 'Eating Croissants the French way',
    locale: 'fr',
  }).id;

  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    trainingId: frTrainingId,
  });

  const frTrainingTriggerId = databaseBuilder.factory.buildTrainingTrigger({
    trainingId: frTrainingId,
    threshold: 0,
    type: 'prerequisite',
  }).id;

  databaseBuilder.factory.buildTrainingTriggerTube({
    trainingTriggerId: frTrainingTriggerId,
    tubeId: 'tube1NLpOetQhutFlA',
    level: 2,
  });

  const frFrTrainingId = databaseBuilder.factory.buildTraining({
    title: 'Apprendre à peindre comme Monet',
    locale: 'fr-fr',
  }).id;

  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    trainingId: frFrTrainingId,
  });

  const frFrTrainingTriggerId = databaseBuilder.factory.buildTrainingTrigger({
    trainingId: frFrTrainingId,
    threshold: 0,
    type: 'prerequisite',
  }).id;

  databaseBuilder.factory.buildTrainingTriggerTube({
    trainingTriggerId: frFrTrainingTriggerId,
    tubeId: 'tube1NLpOetQhutFlA',
    level: 2,
  });
}
