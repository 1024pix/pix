import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(certificateSummaries, { translate }) {
  return new Serializer('certificate-summaries', {
    transform(certificateSummary) {
      return {
        ...certificateSummary,
        comment: certificateSummary.juryComment.getComment(translate),
        reachedMeshLevel: certificateSummary.reachedMeshLevel?.split('_').at(-1) ?? null,
        badgeUrl: certificateSummary.badgeUrl,
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
      'reachedMeshLevel',
      'badgeUrl',
    ],
  }).serialize(certificateSummaries);
}
