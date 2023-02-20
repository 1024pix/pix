import {
  TARGET_PROFILE_STAGES_BADGES_ID,
  TARGET_PROFILE_STAGES_LEVEL_ID,
  TARGET_PROFILE_ONE_COMPETENCE_ID,
} from './target-profiles-builder';

export default function stagesBuilder({ databaseBuilder }) {
  _buildStagesForTargetProfileId(databaseBuilder, TARGET_PROFILE_ONE_COMPETENCE_ID);
  _buildStagesForTargetProfileId(databaseBuilder, TARGET_PROFILE_STAGES_BADGES_ID);
  _buildStagesWithLevelForTargetProfileId(databaseBuilder, TARGET_PROFILE_STAGES_LEVEL_ID);
}

function _buildStagesForTargetProfileId(databaseBuilder, targetProfileId) {
  const stages = [
    { title: 'Bravo !', message: 'Tu as le palier 1', threshold: 0, targetProfileId },
    { title: 'Félicitations !', message: 'Tu as le palier 2', prescriberTitle: 'palier 2', prescriberDescription: 'Maîtrise partielle', threshold: 5, targetProfileId },
    { title: 'Bien joué !', message: 'Tu as le palier 3', prescriberTitle: 'palier 3', prescriberDescription: 'Maîtrise complète', threshold: 15, targetProfileId },
    { title: 'Trop fort(e) !', message: 'Tu as le palier 4', prescriberTitle: 'palier 4', threshold: 60, targetProfileId },
    { title: 'Quel(le) expert(e) !', message: 'Tu as le palier 5', prescriberDescription: 'Maîtrise absolue', threshold: 80, targetProfileId },
  ];

  stages.forEach((stage) => databaseBuilder.factory.buildStage(stage));
}

function _buildStagesWithLevelForTargetProfileId(databaseBuilder, targetProfileId) {
  const stages = [
    { title: 'Pas mal mais pas max', message: 'Tu as le palier 1', level: 0, targetProfileId },
    { title: 'Félicitations !', message: 'Tu as le palier 2', prescriberTitle: 'équivalent niveau 2', prescriberDescription: 'Maîtrise partielle', level: 2, targetProfileId },
    { title: 'Bien joué !', message: 'Tu as le palier 3', prescriberTitle: 'équivalent niveau 3', prescriberDescription: 'Maîtrise complète', level: 3, targetProfileId },
    { title: 'Trop fort(e) !', message: 'Tu as le palier 4', prescriberTitle: 'équivalent niveau 4', level: 4, targetProfileId },
    { title: 'Quel(le) expert(e) !', message: 'Tu as le palier 5', prescriberDescription: 'Maîtrise absolue', level: 5, targetProfileId },
  ];

  stages.forEach((stage) => databaseBuilder.factory.buildStage.withLevel(stage));
}
