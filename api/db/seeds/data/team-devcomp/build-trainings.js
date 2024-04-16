import { PIX_EDU_SMALL_TARGET_PROFILE_ID } from './constants.js';

export function buildTrainings(databaseBuilder) {
  const frTrainingId = databaseBuilder.factory.buildTraining({
    title: 'Apprendre à manger un croissant comme les français',
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

  const frFrTrainingId1 = databaseBuilder.factory.buildTraining({
    title: 'Apprendre à peindre comme Monet',
    locale: 'fr-fr',
  }).id;

  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    trainingId: frFrTrainingId1,
  });

  const frFrTrainingTriggerId1 = databaseBuilder.factory.buildTrainingTrigger({
    trainingId: frFrTrainingId1,
    threshold: 0,
    type: 'prerequisite',
  }).id;

  databaseBuilder.factory.buildTrainingTriggerTube({
    trainingTriggerId: frFrTrainingTriggerId1,
    tubeId: 'tube1NLpOetQhutFlA',
    level: 2,
  });

  const frFrTrainingId2 = databaseBuilder.factory.buildTraining({
    title: 'Didacticiel Module Pix',
    link: '/modules/didacticiel-modulix/details',
    duration: '00:10:00',
    editorName: 'Pix',
    editorLogoUrl: 'https://images.pix.fr/contenu-formatif/editeur/pix-logo.svg',
    type: 'modulix',
    locale: 'fr-fr',
  }).id;

  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    trainingId: frFrTrainingId2,
  });

  const frFrTrainingTriggerId2 = databaseBuilder.factory.buildTrainingTrigger({
    trainingId: frFrTrainingId2,
    threshold: 0,
    type: 'prerequisite',
  }).id;

  databaseBuilder.factory.buildTrainingTriggerTube({
    trainingTriggerId: frFrTrainingTriggerId2,
    tubeId: 'tube1NLpOetQhutFlA',
    level: 2,
  });

  const enTrainingId = databaseBuilder.factory.buildTraining({
    title: 'Eat a croissant like the french',
    locale: 'en-gb',
  }).id;

  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    trainingId: enTrainingId,
  });

  const enTrainingTrigger = databaseBuilder.factory.buildTrainingTrigger({
    trainingId: enTrainingId,
    threshold: 0,
    type: 'prerequisite',
  }).id;

  databaseBuilder.factory.buildTrainingTriggerTube({
    trainingTriggerId: enTrainingTrigger,
    tubeId: 'tube1NLpOetQhutFlA',
    level: 2,
  });
}
