module.exports = function stagesBuilder({ databaseBuilder }) {
  const targetProfileId = 2;

  const stages = [
    { title: 'palier 1', message: 'Tu as le palier 1', threshold: 0, targetProfileId },
    { title: 'palier 2', message: 'Tu as le palier 2', threshold: 20, targetProfileId },
    { title: 'palier 3', message: 'Tu as le palier 3', threshold: 40, targetProfileId },
    { title: 'palier 4', message: 'Tu as le palier 4', threshold: 60, targetProfileId },
    { title: 'palier 5', message: 'Tu as le palier 5', threshold: 80, targetProfileId }
  ];

  stages.forEach((stage) => databaseBuilder.factory.buildStage(stage));
};

