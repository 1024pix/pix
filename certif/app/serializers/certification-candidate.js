import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class CertificationCandidateSerializer extends JSONAPISerializer {
  // This bypasses extractErrors emberData behavior which relies on the property being a function.
  // This should not be needed after upgrading to ember-data v5
  extractErrors = false;

  serialize(...args) {
    const json = super.serialize(...args);

    delete json.data.attributes['complementary-certification']?.hasComplementaryReferential;

    return json;
  }
}
