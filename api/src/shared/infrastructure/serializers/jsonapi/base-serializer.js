import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer: JSONApiSerializer } = jsonapiSerializer;

export class Serializer extends JSONApiSerializer {
  constructor(...args) {
    super(...args);
    this.opts.pluralizeType = false;
  }
}
