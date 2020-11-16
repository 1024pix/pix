import JSONAPISerializer from '@ember-data/serializer/json-api';
export default class SchoolingRegistrationUserAssociationSerializer extends JSONAPISerializer {
  serialize() {
    const json = super.serialize(...arguments);

    const attributesToDelete = Object.keys(json.data.attributes).filter((attribute) => json.data.attributes[attribute] === null);

    attributesToDelete.forEach((attribute) => {
      delete json.data.attributes[attribute];
    });

    return json;
  }
}
