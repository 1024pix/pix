import * as moduleSerializer from '../../infrastructure/serializers/jsonapi/module-serializer.js';
import * as correctionResponseSerializer from '../../infrastructure/serializers/jsonapi/correction-response-serializer.js';
import { usecases } from '../../domain/usecases/index.js';

const getBySlug = async function (request, h, dependencies = { moduleSerializer, usecases }) {
  const { slug } = request.params;
  const module = await dependencies.usecases.getModule({ slug });

  return dependencies.moduleSerializer.serialize(module);
};

const validateAnswer = async function (request, h, dependencies = { correctionResponseSerializer, usecases }) {
  const { moduleSlug, elementId } = request.params;
  const { proposalSelectedId } = request.payload.data.attributes;
  const module = await dependencies.usecases.validateAnswer({ moduleSlug, proposalSelectedId, elementId });

  return dependencies.correctionResponseSerializer.serialize(module);
};

const modulesController = { getBySlug, validateAnswer };

export { modulesController };
