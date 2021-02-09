const { TARGET_PROFILE_STAGES_BADGES_ID, TARGET_PROFILE_ONE_COMPETENCE_ID } = require('./target-profiles-builder');

module.exports = function stagesBuilder({ databaseBuilder }) {
  _buildStagesForTargetProfileId(databaseBuilder, TARGET_PROFILE_ONE_COMPETENCE_ID);
  _buildStagesForTargetProfileId(databaseBuilder, TARGET_PROFILE_STAGES_BADGES_ID);
};

function _buildStagesForTargetProfileId(databaseBuilder, targetProfileId) {
  const stages = [
    { title: 'palier 1', message: 'Tu as le palier 1', threshold: 0, targetProfileId },
    { title: 'palier 2', message: 'Tu as le palier 2', threshold: 5, targetProfileId },
    { title: 'palier 3', message: 'Tu as le palier 3', threshold: 40, targetProfileId },
    { title: 'palier 4', message: 'Tu as le palier 4', threshold: 60, targetProfileId },
    { title: 'palier 5', message: 'Tu as le palier 5', threshold: 80, targetProfileId },
  ];

  stages.forEach((stage) => databaseBuilder.factory.buildStage(stage));
}
