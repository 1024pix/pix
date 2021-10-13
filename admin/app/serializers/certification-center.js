import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class CertificationCenter extends JSONAPISerializer {
  attrs = {
    accreditations: { serialize: true },
  };
}
