import Inflector from 'inflected';
import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer: JSONApiSerializer } = jsonapiSerializer;

export class Serializer extends JSONApiSerializer {
  constructor(...args) {
    super(...args);

    this.opts.keyForAttribute = args[1]?.keyForAttribute ?? 'camelCase';
    const customTypeForAttribute = this.opts.typeForAttribute;
    this.opts.typeForAttribute = (attribute, attrVal) => {
      const customType =
        typeof customTypeForAttribute === 'function' ? customTypeForAttribute(attribute, attrVal) : undefined;
      return customType ?? Inflector.singularize(attribute);
    };
  }
}
