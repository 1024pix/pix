const { TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE } = require('./target-profiles-builder');

function trainingBuilder({ databaseBuilder }) {
  const training = databaseBuilder.factory.buildTraining({
    title: 'Apprendre en s\'amusant',
    link: 'http://www.example.net',
    type: 'webinaire',
    duration: '06:00:00',
    locale: 'fr-fr',
  });
  databaseBuilder.factory.buildTargetProfileTraining({
    trainingId: training.id,
    targetProfileId: TARGET_PROFILE_PIX_EDU_FORMATION_INITIALE_2ND_DEGRE,
  });
}

module.exports = {
  trainingBuilder,
};
