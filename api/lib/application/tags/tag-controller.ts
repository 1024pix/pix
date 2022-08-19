import { Request, ResponseToolkit } from "@hapi/hapi";
const tagSerializer = require('../../infrastructure/serializers/jsonapi/tag-serializer');
const usecases = require('../../domain/usecases');

type Payload<T> = {
  data: {
    attributes: T
  }
};

type TagJsonApiAttributes = {
  name: string;
}

module.exports = {
  async create(request: Request, h: ResponseToolkit) {
    const tagName = (request.payload as Payload<TagJsonApiAttributes>).data.attributes['name'].toUpperCase();
    const createdTag = await usecases.createTag.execute(tagName);
    // la méthode .created() requiert un paramètre (voir fichier de définitions des types) qui est une URI de redirection non nécessaire dans notre cas
    return h.response(tagSerializer.serialize(createdTag)).created('');
  },

  async findAllTags() {
    const organizationsTags = await usecases.findAllTags();
    return tagSerializer.serialize(organizationsTags);
  },
};
