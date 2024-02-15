import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class GrainSerializer extends JSONAPISerializer {
  extractRelationship(relationshipHash) {
    const extractRelationship = super.extractRelationship(relationshipHash);

    extractRelationship.data = extractRelationship.data.filter(({ type }) => {
      try {
        this.store.modelFor(type);
      } catch (e) {
        return false;
      }
      return true;
    });

    return extractRelationship;
  }
}
