import ApplicationSerializer from './application';

export default class TargetProfileSerializer extends ApplicationSerializer {
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
          name: attributes.name,
          'internal-name': attributes['internal-name'],
        },
      },
    };

    if (options?.tubes) {
      json.data.attributes.tubes = options.tubes;
    }

    return json;
  }
}
