const tagSerializer = require('../../infrastructure/serializers/jsonapi/tag-serializer.js');
const usecases = require('../../domain/usecases/index.js');

module.exports = {
  async create(request, h, dependencies = { tagSerializer }) {
    const tagName = request.payload.data.attributes['name'].toUpperCase();
    const createdTag = await usecases.createTag({ tagName });
    return h.response(dependencies.tagSerializer.serialize(createdTag)).created();
  },

  async findAllTags(request, h, dependencies = { tagSerializer }) {
    const organizationsTags = await usecases.findAllTags();
    return dependencies.tagSerializer.serialize(organizationsTags);
  },

  async getRecentlyUsedTags(request, h, dependencies = { tagSerializer }) {
    const tagId = request.params.id;
    const recentlyUsedTags = await usecases.getRecentlyUsedTags({ tagId });
    return dependencies.tagSerializer.serialize(recentlyUsedTags);
  },
};
