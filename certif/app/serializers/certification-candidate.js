import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class CertificationCandidateSerializer extends JSONAPISerializer {
  serialize(...args) {
    const json = super.serialize(...args);

    delete json.data.attributes['complementary-certification']?.hasComplementaryReferential;

    return json;
  }
}
