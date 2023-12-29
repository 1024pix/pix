const create = async function (request, h, { usecases, passageSerializer }) {
  const { 'module-id': moduleId } = request.payload.data.attributes;
  const passage = await usecases.createPassage({ moduleId });

  const serializedPassage = passageSerializer.serialize(passage);
  return h.response(serializedPassage).created();
};

const passageController = { create };

export { passageController };
