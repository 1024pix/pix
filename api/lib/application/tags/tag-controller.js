import * as tagSerializer from '../../../src/organizational-entities/infrastructure/serializers/jsonapi/tag-serializer.js';
import { usecases } from '../../domain/usecases/index.js';

const findAllTags = async function (request, h, dependencies = { tagSerializer }) {
  const organizationsTags = await usecases.findAllTags();
  return dependencies.tagSerializer.serialize(organizationsTags);
};

const getRecentlyUsedTags = async function (request, h, dependencies = { tagSerializer }) {
  const tagId = request.params.id;
  const recentlyUsedTags = await usecases.getRecentlyUsedTags({ tagId });
  return dependencies.tagSerializer.serialize(recentlyUsedTags);
};

const tagController = { findAllTags, getRecentlyUsedTags };

export { tagController };
