import { requestResponseUtils } from '../../../shared/infrastructure/utils/request-response-utils.js';

const create = async function (request, h, { usecases, passageSerializer }) {
  const { 'module-id': moduleSlug } = request.payload.data.attributes;
  const requestTimestamp = requestResponseUtils.extractTimestampFromRequest(request);
  const userId = requestResponseUtils.extractUserIdFromRequest(request);
  const passage = await usecases.createPassage({ moduleSlug, userId, occurredAt: new Date(requestTimestamp) });

  const serializedPassage = passageSerializer.serialize(passage);
  return h.response(serializedPassage).created();
};

const verifyAndSaveAnswer = async function (request, h, { usecases, elementAnswerSerializer }) {
  const { passageId } = request.params;
  const { 'element-id': elementId, 'user-response': userResponse } = request.payload.data.attributes;
  const elementAnswer = await usecases.verifyAndSaveAnswer({ passageId, elementId, userResponse });
  const serializedElementAnswer = elementAnswerSerializer.serialize(elementAnswer);
  return h.response(serializedElementAnswer).created();
};

const terminate = async function (request, h, { usecases, passageSerializer }) {
  const { passageId } = request.params;
  const requestTimestamp = requestResponseUtils.extractTimestampFromRequest(request);
  const updatedPassage = await usecases.terminatePassage({ passageId, occurredAt: new Date(requestTimestamp) });
  return passageSerializer.serialize(updatedPassage);
};

const passageController = { create, verifyAndSaveAnswer, terminate };

export { passageController };
