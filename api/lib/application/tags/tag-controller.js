import { usecases } from '../../domain/usecases/index.js';
import * as tagSerializer from '../../infrastructure/serializers/jsonapi/tag-serializer.js';

const create = async function (request, h, dependencies = { tagSerializer }) {
  const tagName = request.payload.data.attributes['name'].toUpperCase();
  const createdTag = await usecases.createTag({ tagName });
  return h.response(dependencies.tagSerializer.serialize(createdTag)).created();
};

const findAllTags = async function (request, h, dependencies = { tagSerializer }) {
  const organizationsTags = await usecases.findAllTags();
  return dependencies.tagSerializer.serialize(organizationsTags);
};

const getRecentlyUsedTags = async function (request, h, dependencies = { tagSerializer }) {
  const tagId = request.params.id;
  const recentlyUsedTags = await usecases.getRecentlyUsedTags({ tagId });
  return dependencies.tagSerializer.serialize(recentlyUsedTags);
};

const tagController = { create, findAllTags, getRecentlyUsedTags };

export { tagController };
