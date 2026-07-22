import { JSONAPISerializer } from '@warp-drive/legacy/serializer/json-api';
import { camelize, dasherize } from '@warp-drive/utilities/string';

export default class ApplicationSerializer extends JSONAPISerializer {
  keyForAttribute(key) {
    return camelize(key);
  }

  keyForRelationship(key) {
    return camelize(key);
  }

  extractAttributes(modelClass, resourceHash) {
    const attributes = {};

    if (resourceHash.attributes) {
      modelClass.eachAttribute((key) => {
        const attributeKey = this.keyForAttribute(key, 'deserialize');
        const camel = resourceHash.attributes[camelize(attributeKey)];
        const kebab = resourceHash.attributes[dasherize(attributeKey)];

        if(camel) {
          attributes[camelize(attributeKey)] = camel;
        }
        else {
          attributes[camelize(attributeKey)] = kebab;
        }
      });
    }

    return attributes;
  }

  extractRelationships(modelClass, resourceHash) {
    const relationships = {};
    console.log({modelClass, resourceHash})

    if (resourceHash.relationships) {
      modelClass.eachRelationship((key) => {
        const camel = resourceHash.relationships[camelize(key)];
        const kebab = resourceHash.relationships[dasherize(key)];

        if(camel) {
          relationships[camelize(key)] = camel;
        }
        else {
          relationships[camelize(key)] = kebab;
        }
      });
    }

    return relationships;
  }

  // extractRelationships(modelClass, resourceHash) {
  //   if (resourceHash.relationships) {
  //     modelClass.eachRelationship((key) => {
  //       if (resourceHash.relationships[key] === undefined) {
  //         const dasherizeKey = dasherize(key);
  //         if (resourceHash.relationships[dasherizeKey] !== undefined) {
  //           resourceHash.relationships[key] = resourceHash.relationships[dasherizeKey];
  //         }
  //       }
  //     });
  //   }
  //   return super.extractRelationships(modelClass, resourceHash);
  // }
}
