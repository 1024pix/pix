import { Training } from '../../../../src/devcomp/domain/models/Training.js';
import { DEVCOMP_BASE_TRAINING_ID, PIX_EDU_SMALL_TARGET_PROFILE_ID } from './constants.js';

export function buildTrainings(databaseBuilder) {
  let trainingId = DEVCOMP_BASE_TRAINING_ID;
  const frTrainingId1 = databaseBuilder.factory.buildTraining({
    id: trainingId++,
    title: 'Apprendre à manger un croissant comme les français',
    internalTitle: 'Apprendre à manger un croissant comme les français',
    duration: { days: 0, hours: 0, minutes: 0 },
    locales: ['fr'],
    objectives: ['Repérer si le croissant est de bonne qualité', 'Rechercher un croissant pour le manger'],
    description:
      "Aujourd'hui, manger un croissant est tout un art en France. De nombreux touristes viennent en France et font le tour des meilleures boulangeries pour en manger, mais sans connaître les différentes manières de le savourer pleinement.",
  }).id;

  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    trainingId: frTrainingId1,
  });

  const frTrainingTriggerId = databaseBuilder.factory.buildTrainingTrigger({
    trainingId: frTrainingId1,
    threshold: 0,
    type: 'prerequisite',
  }).id;

  databaseBuilder.factory.buildTrainingTriggerTube({
    trainingTriggerId: frTrainingTriggerId,
    tubeId: 'tube1NLpOetQhutFlA',
    level: 2,
  });

  const frTrainingId2 = databaseBuilder.factory.buildTraining({
    id: trainingId++,
    title: 'Ce qu’il faut éviter de dire à une IA générative',
    internalTitle: 'Ce qu’il faut éviter de dire à une IA générative',
    link: '/modules/e71a9bdd/iagenethique',
    duration: '00:10:00',
    editorName: 'Pix',
    editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg',
    type: 'modulix',
    locales: ['fr'],
    objectives: [
      'Comprendre que les conversations avec les IA génératives sont réutilisées',
      'Savoir rédiger un prompt qui n’inclut pas d’informations personnelles',
    ],
    registrationRequired: true,
    description:
      'Quand vous discutez avec un logiciel d’intelligence artificielle (IA) générative, la conversation n’est pas privée. Tout ce que vous écrivez peut être enregistré et parfois réutilisé pour améliorer l’IA. Dans ce module, vous allez comprendre pourquoi les échanges avec une IA générative ne sont pas totalement privés et quelles informations il vaut mieux éviter d’écrire dans vos instructions (prompts).',
  }).id;

  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    trainingId: frTrainingId2,
  });

  const frTrainingTriggerId2 = databaseBuilder.factory.buildTrainingTrigger({
    trainingId: frTrainingId2,
    threshold: 0,
    type: 'prerequisite',
  }).id;

  databaseBuilder.factory.buildTrainingTriggerTube({
    trainingTriggerId: frTrainingTriggerId2,
    tubeId: 'tube1NLpOetQhutFlA',
    level: 2,
  });

  const frTrainingId3 = databaseBuilder.factory.buildTraining({
    id: trainingId++,
    title: 'Des mots de passe solides',
    internalTitle: 'Des mots de passe solides',
    link: '/modules/3e5fa7fc/mots-de-passe-securises',
    duration: '2days 00:12:00',
    editorName: 'Pix',
    editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg',
    type: 'modulix',
    locales: ['fr'],
    objectives: ['Connaître les principaux risques liés aux mots de passe', 'Savoir créer un mot de passe solide'],
    deliveryMode: Training.modes.ONSITE,
    description:
      "Aujourd'hui, on utilise des mots de passe pour tout : son téléphone, son adresse mail, ses réseaux sociaux. Dans ce module, vous allez découvrir pourquoi et comment créer des mots de passe solides.",
  }).id;

  databaseBuilder.factory.buildTargetProfileTraining({
    targetProfileId: PIX_EDU_SMALL_TARGET_PROFILE_ID,
    trainingId: frTrainingId3,
  });

  const frTrainingTriggerId3 = databaseBuilder.factory.buildTrainingTrigger({
    trainingId: frTrainingId3,
    threshold: 0,
    type: 'prerequisite',
  }).id;

  databaseBuilder.factory.buildTrainingTriggerTube({
    trainingTriggerId: frTrainingTriggerId3,
    tubeId: 'tube1NLpOetQhutFlA',
    level: 2,
  });

  const frFrTrainingId1 = databaseBuilder.factory.buildTraining({
    id: trainingId++,
    title: 'Apprendre à peindre comme Monet',
    internalTitle: 'Apprendre à peindre comme Monet',
    locales: ['fr-fr'],
    objectives: ['Connaître Monet', 'Avoir les bases pour peindre'],
    deliveryMode: Training.modes.REMOTE,
    registrationRequired: true,
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
    id: trainingId++,
    title: 'Ce qu’il faut éviter de dire à une IA générative',
    internalTitle: 'Ce qu’il faut éviter de dire à une IA générative',
    link: '/modules/e71a9bdd/iagenethique',
    duration: '00:10:00',
    editorName: 'Pix',
    editorLogoUrl: 'https://assets.pix.org/contenu-formatif/editeur/pix-logo.svg',
    type: 'modulix',
    locales: ['fr-fr'],
    objectives: [
      'Comprendre que les conversations avec les IA génératives sont réutilisées',
      'Savoir rédiger un prompt qui n’inclut pas d’informations personnelles',
    ],
    deliveryMode: Training.modes.REMOTE,
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
    id: trainingId++,
    title: 'Eat a croissant like the french',
    internalTitle: 'Eat a croissant like the french',
    locales: ['en'],
    objectives: ['How to tell if a croissant is of good quality', 'Buy a croissant to eat'],
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

  return [frTrainingId1, frTrainingId2, frTrainingId3, frFrTrainingId1, frFrTrainingId2, enTrainingId];
}
