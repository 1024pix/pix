import { getChallengeLocale } from '../../../shared/infrastructure/utils/request-response-utils.js';
import { usecases } from '../domain/usecases/index.js';
import { campaignResultLevelsPerTubesAndCompetencesSerializer } from '../infrastructure/serializers/jsonapi/campaign-result-levels-per-tubes-and-competences-serializer.js';
import { divisionSerializer } from '../infrastructure/serializers/jsonapi/division-serializer.js';
import { groupSerializer } from '../infrastructure/serializers/jsonapi/group-serializer.js';
import { presentationStepsSerializer } from '../infrastructure/serializers/jsonapi/presentation-steps-serializer.js';

const division = async function (request) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.campaignId;

  const divisions = await usecases.getParticipantsDivision({ userId, campaignId });
  return divisionSerializer.serialize(divisions);
};

const getGroups = async function (request) {
  const { userId } = request.auth.credentials;
  const campaignId = request.params.campaignId;

  const groups = await usecases.getParticipantsGroup({ userId, campaignId });
  return groupSerializer.serialize(groups);
};

const getPresentationSteps = async function (request, _, dependencies = { presentationStepsSerializer }) {
  const { userId } = request.auth.credentials;
  const campaignCode = request.params.campaignCode;
  const locale = getChallengeLocale(request);

  const presentationSteps = await usecases.getPresentationSteps({ userId, campaignCode, locale });
  return dependencies.presentationStepsSerializer.serialize(presentationSteps);
};

const getLevelPerTubesAndCompetences = async function (
  request,
  h,
  dependencies = { campaignResultLevelsPerTubesAndCompetencesSerializer },
) {
  const { campaignId } = request.params;
  const locale = getChallengeLocale(request);
  const campaignAnalysis = await usecases.getResultLevelsPerTubesAndCompetences({
    campaignId,
    locale,
  });
  return dependencies.campaignResultLevelsPerTubesAndCompetencesSerializer.serialize(campaignAnalysis);
};
const campaignController = {
  division,
  getGroups,
  getPresentationSteps,
  getLevelPerTubesAndCompetences,
};

export { campaignController };
