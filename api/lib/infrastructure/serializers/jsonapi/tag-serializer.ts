import { Tag } from '../../../domain/models/Tag';

const { Serializer } = require('jsonapi-serializer');

export class TagSerializer {
  serialize(tags: Tag[] | Tag) {
    return new Serializer('tags', {
      attributes: ['name'],
    }).serialize(tags);
  }
}

export const tagSerializer = new TagSerializer();
