const create = async function (request, h, { usecases, passageSerializer }) {
  const { 'module-id': moduleId } = request.payload.data.attributes;
  const passage = await usecases.createPassage({ moduleId });

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

const passageController = { create, verifyAndSaveAnswer };

export { passageController };
