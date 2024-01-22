const getBySlug = async function (request, h, { moduleSerializer, usecases }) {
  const { slug } = request.params;
  const module = await usecases.getModule({ slug });

  return moduleSerializer.serialize(module);
};

const modulesController = { getBySlug };

export { modulesController };
