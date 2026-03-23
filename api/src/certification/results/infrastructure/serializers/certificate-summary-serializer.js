import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (certificateSummaries, { translate }) {
  return new Serializer('certificate-summaries', {
    transform(certificateSummary) {
      return {
        ...certificateSummary,
        comment: certificateSummary.juryComment.getComment(translate),
      };
    },
    attributes: [
      'verificationCode',
      'certificationStartedAt',
      'certificationFramework',
      'certificationCenterName',
      'pixScore',
      'comment',
      'status',
      'extraCertificationStatus',
      'certificateType',
      'reachedMeshIndex',
    ],
  }).serialize(certificateSummaries);
};

export { serialize };
