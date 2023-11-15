import * as moduleSerializer from '../../infrastructure/serializers/jsonapi/module-serializer.js';
import * as elementAnswerSerializer from '../../infrastructure/serializers/jsonapi/element-answer-serializer.js';
import { usecases } from '../../domain/usecases/index.js';

const getBySlug = async function (request, h, dependencies = { moduleSerializer, usecases }) {
  const { slug } = request.params;
  const module = await dependencies.usecases.getModule({ slug });

  return dependencies.moduleSerializer.serialize(module);
};

const validateAnswer = async function (request, h, dependencies = { elementAnswerSerializer, usecases }) {
  const { moduleSlug, elementId } = request.params;
  const { 'user-response': userResponse } = request.payload.data.attributes;
  const answer = await dependencies.usecases.validateAnswer({ moduleSlug, userResponse, elementId });

  return dependencies.elementAnswerSerializer.serialize(answer);
};

const modulesController = { getBySlug, validateAnswer };

export { modulesController };
