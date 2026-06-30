import { generateCSVTemplate } from '../../shared/infrastructure/serializers/csv/csv-template.js';
import { extractUserIdFromRequest } from '../../shared/infrastructure/utils/request-response-utils.js';
import { QUEST_HEADER } from '../domain/constants.js';
import { usecases } from '../domain/usecases/index.js';
import { questResultSerializer } from '../infrastructure/serializers/quest-result-serializer.js';

const getQuestResults = async function (request, h, dependencies = { questResultSerializer }) {
  const { campaignParticipationId } = request.params;
  const userId = extractUserIdFromRequest(request);

  const questResults = await usecases.getQuestResultsForCampaignParticipation({ userId, campaignParticipationId });

  const serializedQuestResults = dependencies.questResultSerializer.serialize(questResults);

  return h.response(serializedQuestResults);
};

const getTemplateForCreateOrUpdateQuestsInBatch = async function (request, h) {
  const fields = QUEST_HEADER.columns.map(({ name }) => name);
  const csvTemplateFileContent = generateCSVTemplate(fields);

  return h
    .response(csvTemplateFileContent)
    .header('Content-Type', 'text/csv; charset=utf-8')
    .header('content-disposition', 'filename=create-or-update-quests-in-batch')
    .code(200);
};

const createOrUpdateQuestsInBatch = async function (request, h) {
  await usecases.createOrUpdateQuestsInBatch({
    filePath: request.payload.path,
  });
  return h.response().code(204);
};

const checkUserQuest = async function (request, h) {
  const result = await usecases.checkUserQuest({
    questId: request.payload.data.attributes['quest-id'],
    userId: request.payload.data.attributes['user-id'],
  });

  return h.response({ data: { attributes: { 'is-successful': result } } }).code(200);
};

const questController = {
  checkUserQuest,
  getQuestResults,
  createOrUpdateQuestsInBatch,
  getTemplateForCreateOrUpdateQuestsInBatch,
};

export { questController };
