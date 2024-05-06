import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class TargetProfileSerializer extends JSONAPISerializer {
  serialize(snapshot, options) {
    const {
      data: { attributes },
    } = super.serialize(...arguments);

    const json = {
      data: {
        attributes: {
          'are-knowledge-elements-resettable': attributes['are-knowledge-elements-resettable'],
          category: attributes.category,
          comment: attributes.comment,
          description: attributes.description,
          'image-url': attributes['image-url'],
          'is-public': attributes['is-public'],
          name: attributes.name,
          'owner-organization-id': attributes['owner-organization-id'],
        },
      },
    };

    if (options?.tubes) {
      json.data.attributes.tubes = options.tubes;
    }

    const isUpdateMode = options?.update;
    if (isUpdateMode) {
      delete json.data.attributes['is-public'];
      delete json.data.attributes['owner-organization-id'];
    }

    return json;
  }
}
