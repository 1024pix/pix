import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (certificationEligibility) {
  return new Serializer('isCertifiables', {
    transform(certificationEligibility) {
      const clone = Object.assign({}, certificationEligibility);
      clone.isCertifiable = clone.pixCertificationEligible;
      return clone;
    },
    attributes: ['isCertifiable', 'complementaryCertifications'],
    complementaryCertifications: ['label', 'imageUrl', 'isOutdated', 'isAcquired'],
  }).serialize(certificationEligibility);
};

export { serialize };
