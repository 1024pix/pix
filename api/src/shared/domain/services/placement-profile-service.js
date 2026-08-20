import * as scoringService from '../../../evaluation/domain/services/scoring/scoring-service.js';
import * as knowledgeStateSnapshotRepository from '../../../prescription/campaign/infrastructure/repositories/knowledge-state-snapshot-repository.js';
import { PlacementProfile } from '../../domain/models/PlacementProfile.js';
import { UserCompetence } from '../../domain/models/UserCompetence.js';
import * as competenceRepository from '../../infrastructure/repositories/competence-repository.js';
import * as knowledgeStateRepository from '../../infrastructure/repositories/knowledge-state-repository.js';

async function getPlacementProfile({ userId, limitDate, allowExcessPixAndLevels = true, locale }) {
  const pixCompetences = await competenceRepository.listPixCompetencesOnly({ locale });

  return _generatePlacementProfile({
    userId,
    profileDate: limitDate,
    competences: pixCompetences,
    allowExcessPixAndLevels,
  });
}

function _createUserCompetencesV2({ knowledgeState, competences, allowExcessPixAndLevels = true }) {
  return competences.map((competence) => {
    const competenceState = knowledgeState.restrictedToCompetence(competence.id);

    const { pixScoreForCompetence, currentLevel } = scoringService.calculateScoringInformationForCompetence({
      validatedSkills: competenceState.validatedSkills(),
      allowExcessPix: allowExcessPixAndLevels,
      allowExcessLevel: allowExcessPixAndLevels,
    });

    // La certification V2 ne retient que les acquis réellement réussis en réponse
    // directe : les inférés ne donnent pas lieu à une question de certification.
    const directlyValidatedCompetenceSkills = competenceState
      .validatedSkills()
      .filter((skill) => competenceState.isDirect(skill));

    return new UserCompetence({
      id: competence.id,
      areaId: competence.areaId,
      index: competence.index,
      name: competence.name,
      estimatedLevel: currentLevel,
      pixScore: pixScoreForCompetence,
      skills: directlyValidatedCompetenceSkills,
    });
  });
}

async function _generatePlacementProfile({ userId, profileDate, competences, allowExcessPixAndLevels }) {
  const knowledgeState = await knowledgeStateRepository.findByUserId({
    userId,
    limitDate: profileDate,
  });

  const userCompetences = _createUserCompetencesV2({
    knowledgeState,
    competences,
    allowExcessPixAndLevels,
  });

  return new PlacementProfile({
    userId,
    profileDate,
    userCompetences,
  });
}

async function getPlacementProfilesWithSnapshotting({ participations, competences, allowExcessPixAndLevels = true }) {
  const campaignParticipationIds = participations.map(({ campaignParticipationId }) => campaignParticipationId);
  const knowledgeStateParticipations =
    await knowledgeStateSnapshotRepository.findCampaignParticipationKnowledgeStates(campaignParticipationIds);

  return participations.map((participation) => {
    const stateForParticipation = knowledgeStateParticipations.find((knowledgeStateParticipation) => {
      return knowledgeStateParticipation.campaignParticipationId === participation.campaignParticipationId;
    });

    const userCompetences = _createUserCompetencesV2({
      knowledgeState: stateForParticipation.knowledgeState,
      competences,
      allowExcessPixAndLevels,
    });

    return new PlacementProfile({
      userId: participation.userId,
      profileDate: participation.sharedAt,
      userCompetences,
    });
  });
}

export { getPlacementProfile, getPlacementProfilesWithSnapshotting };
