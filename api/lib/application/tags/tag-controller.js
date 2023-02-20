import tagSerializer from '../../infrastructure/serializers/jsonapi/tag-serializer';
import usecases from '../../domain/usecases';

export default {
  async create(request, h) {
    const tagName = request.payload.data.attributes['name'].toUpperCase();
    const createdTag = await usecases.createTag({ tagName });
    return h.response(tagSerializer.serialize(createdTag)).created();
  },

  async findAllTags() {
    const organizationsTags = await usecases.findAllTags();
    return tagSerializer.serialize(organizationsTags);
  },

  async getRecentlyUsedTags(request) {
    const tagId = request.params.id;
    const recentlyUsedTags = await usecases.getRecentlyUsedTags({ tagId });
    return tagSerializer.serialize(recentlyUsedTags);
  },
};
