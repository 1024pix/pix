const getBySlug = async function (request, h, { moduleSerializer, usecases }) {
  const { slug } = request.params;
  const module = await usecases.getModule({ slug });

  return moduleSerializer.serialize(module);
};

const verifyAnswer = async function (request, h, { elementAnswerSerializer, usecases }) {
  const { moduleSlug, elementId } = request.params;
  const { 'user-response': userResponse } = request.payload.data.attributes;
  const answer = await usecases.verifyAnswer({ moduleSlug, userResponse, elementId });

  return elementAnswerSerializer.serialize(answer);
};

const modulesController = { getBySlug, verifyAnswer };

export { modulesController };
