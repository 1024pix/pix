import { usecases } from '../../domain/usecases/index.js';
import * as tagSerializer from '../../infrastructure/serializers/jsonapi/tag-serializer.js';

const create = async function (request, h, dependencies = { tagSerializer }) {
  const tagName = request.payload.data.attributes['name'].toUpperCase();
  const createdTag = await usecases.createTag({ tagName });
  return h.response(dependencies.tagSerializer.serialize(createdTag)).created();
};

const tagAdminController = { create };

export { tagAdminController };
