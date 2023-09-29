import * as moduleSerializer from '../../infrastructure/serializers/jsonapi/module-serializer.js';
import { usecases } from '../../domain/usecases/index.js';

const getBySlug = async function (request, h, dependencies = { moduleSerializer, usecases }) {
  const { slug } = request.params;
  const module = await dependencies.usecases.getModule({ slug });

  return dependencies.moduleSerializer.serialize(module);
};

const modulesController = { getBySlug };

export { modulesController };
