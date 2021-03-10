const { TARGET_PROFILE_STAGES_BADGES_ID, TARGET_PROFILE_ONE_COMPETENCE_ID } = require('./target-profiles-builder');

module.exports = function stagesBuilder({ databaseBuilder }) {
  _buildStagesForTargetProfileId(databaseBuilder, TARGET_PROFILE_ONE_COMPETENCE_ID);
  _buildStagesForTargetProfileId(databaseBuilder, TARGET_PROFILE_STAGES_BADGES_ID);
};

function _buildStagesForTargetProfileId(databaseBuilder, targetProfileId) {
  const stages = [
    { title: 'Bravo !', message: 'Tu as le palier 1', prescriberDescription: 'palier 1 c’est nul', threshold: 0, targetProfileId },
    { title: 'Félicitations !', message: 'Tu as le palier 2', prescriberTitle: 'palier 2', prescriberDescription: 'Maîtrise partielle', threshold: 5, targetProfileId },
    { title: 'Bien joué !', message: 'Tu as le palier 3', prescriberTitle: 'palier 3', prescriberDescription: 'Maîtrise complète', threshold: 40, targetProfileId },
    { title: 'Trop fort(e) !', message: 'Tu as le palier 4', prescriberTitle: 'palier 4', prescriberDescription: 'Maîtrise experte', threshold: 60, targetProfileId },
    { title: 'Quel(le) expert(e) !', message: 'Tu as le palier 5', prescriberDescription: 'Maîtrise absolue', threshold: 80, targetProfileId },
  ];

  stages.forEach((stage) => databaseBuilder.factory.buildStage(stage));
}
