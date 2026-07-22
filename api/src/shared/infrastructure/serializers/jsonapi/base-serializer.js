import Inflector from 'inflected';
import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer: JSONApiSerializer } = jsonapiSerializer;

export class Serializer extends JSONApiSerializer {
  constructor(...args) {
    super(...args);

    const customTypeForAttribute = this.opts.typeForAttribute;
    this.opts.typeForAttribute = (attribute, attrVal) => {
      const customType =
        typeof customTypeForAttribute === 'function' ? customTypeForAttribute(attribute, attrVal) : undefined;
      return customType ?? Inflector.singularize(attribute);
    };
  }
}
