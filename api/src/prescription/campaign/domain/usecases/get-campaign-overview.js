import { MAX_REACHABLE_LEVEL } from '../../../../shared/constants.js';
import { CampaignTypes } from '../../../shared/domain/constants.ts';
import { CampaignCompetence } from '../read-models/CampaignCompetence.js';
import { CampaignOverviewWithCompetences } from '../read-models/CampaignOverviewWithCompetences.js';

/**
 * Returns the campaign overview enriched with the competences of its learning content:
 * - ASSESSMENT, EXAM: competences of the target profile, max level is the average of the tubes max level
 * - PROFILES_COLLECTION: all Pix competences, max level is MAX_REACHABLE_LEVEL
 *
 * @param {object} args
 * @param {number} args.campaignId
 * @param {string} args.locale
 * @returns {Promise<CampaignOverviewWithCompetences|null>} null when the campaign does not exist
 */
export async function getCampaignOverview({
  campaignId,
  locale,
  campaignOverviewRepository,
  learningContentRepository,
  competenceRepository,
}) {
  const campaignOverview = await campaignOverviewRepository.get({ campaignId });
  if (!campaignOverview) return null;

  let competences;
  switch (campaignOverview.type) {
    case CampaignTypes.ASSESSMENT:
    case CampaignTypes.EXAM:
      competences = await getTargetProfileCompetences({ campaignId, locale, learningContentRepository });
      break;
    case CampaignTypes.PROFILES_COLLECTION:
      competences = await getPixCompetences({ locale, competenceRepository });
      break;
    default:
      competences = [];
  }

  return new CampaignOverviewWithCompetences({ ...campaignOverview, competences });
}

async function getTargetProfileCompetences({ campaignId, locale, learningContentRepository }) {
  const learningContent = await learningContentRepository.findByCampaignId(campaignId, locale);
  return learningContent.competences.map(
    (competence) =>
      new CampaignCompetence({
        id: competence.id,
        index: competence.index,
        name: competence.name,
        // WHY: same computation as the competence max level displayed in Pix Orga campaign results
        maxLevel: averageBy(competence.tubes, 'maxLevel'),
      }),
  );
}

async function getPixCompetences({ locale, competenceRepository }) {
  const pixCompetences = await competenceRepository.listPixCompetencesOnly({ locale });
  return pixCompetences.map(
    (competence) =>
      new CampaignCompetence({
        id: competence.id,
        index: competence.index,
        name: competence.name,
        maxLevel: MAX_REACHABLE_LEVEL,
      }),
  );
}

function averageBy(collection, propName) {
  return collection.reduce((acc, item) => acc + item[propName], 0) / collection.length;
}
