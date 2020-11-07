import JSONAPISerializer from '@ember-data/serializer/json-api';
import sortBy from 'lodash/sortBy';

export default class Certification extends JSONAPISerializer {

  normalize(typeHash, hash) {
    const competencesWithMark = hash.attributes['competences-with-mark'];
    hash.attributes['competences-with-mark'] = sortBy(competencesWithMark, ['competence_code']);
    return super.normalize(typeHash, hash);
  }

  normalizeFindRecordResponse(store, primaryModelClass, payload, id) {
    payload.data.id = id;
    return this.normalizeSingleResponse(...arguments);
  }

  serialize(snapshot, options) {
    if (options && options.onlyInformation) {
      const data = {};
      this.serializeAttribute(snapshot, data, 'firstName', 'first-name');
      this.serializeAttribute(snapshot, data, 'lastName', 'last-name');
      this.serializeAttribute(snapshot, data, 'birthplace', 'birthplace');
      this.serializeAttribute(snapshot, data, 'birthdate', 'birthdate');
      this.serializeAttribute(snapshot, data, 'externalId', 'external-id');
      this.serializeAttribute(snapshot, data, 'isPublished', 'is-published');
      data.type = 'certifications';
      if (options.includeId) {
        data.id = parseInt(snapshot.id);
      }
      return { data };
    } else {
      return super.serialize(...arguments);
    }
  }

  modelNameFromPayloadKey() {
    return 'certification';
  }
}
