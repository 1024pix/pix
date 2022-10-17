const { TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE } = require('./target-profiles-builder');

function trainingBuilder({ databaseBuilder }) {
  const training1 = databaseBuilder.factory.buildTraining({
    title: 'Apprendre en s\'amusant',
    link: 'http://www.example.net',
    type: 'webinaire',
    duration: '06:00:00',
    locale: 'fr-fr',
  });
  const training2 = databaseBuilder.factory.buildTraining({
    title: 'Speed training',
    link: 'http://www.example2.net',
    type: 'autoformation',
    duration: '00:00:05',
    locale: 'fr-fr',
  });
  const training3 = databaseBuilder.factory.buildTraining({
    title: 'Comment toiletter son chien',
    link: 'http://www.example3.net',
    type: 'autoformation',
    duration: '10:00:00',
    locale: 'fr-fr',
  });
  const training4 = databaseBuilder.factory.buildTraining({
    title: 'Créer un tabouret',
    link: 'http://www.example4.net',
    type: 'webinaire',
    duration: '47:00:00',
    locale: 'fr-fr',
  });
  const training5 = databaseBuilder.factory.buildTraining({
    title: 'Manger bun\'s tous les midis',
    link: 'http://www.example5.net',
    type: 'webinaire',
    duration: '06:00:00',
    locale: 'fr-fr',
  });
  databaseBuilder.factory.buildTargetProfileTraining({
    trainingId: training1.id,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  });
  databaseBuilder.factory.buildTargetProfileTraining({
    trainingId: training2.id,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  });
  databaseBuilder.factory.buildTargetProfileTraining({
    trainingId: training3.id,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  });
  databaseBuilder.factory.buildTargetProfileTraining({
    trainingId: training4.id,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  });
  databaseBuilder.factory.buildTargetProfileTraining({
    trainingId: training5.id,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  });
}

module.exports = {
  trainingBuilder,
};
