module.exports = function stagesBuilder({ databaseBuilder }) {
  _buildStagesForTargetProfileId(databaseBuilder, 2);

  const targetProfileIdWithBadges = 984165;
  _buildStagesForTargetProfileId(databaseBuilder, targetProfileIdWithBadges);
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
