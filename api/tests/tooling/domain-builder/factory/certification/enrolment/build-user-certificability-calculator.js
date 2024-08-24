import { UserCertificabilityCalculator } from '../../../../../../src/certification/enrolment/domain/models/UserCertificabilityCalculator.js';

const buildUserCertificabilityCalculator = function ({
  id = 2,
  userId = 123,
  certificability = [{ key: 'data' }],
  certificabilityV2 = [{ keyV2: 'dataV2' }],
  latestKnowledgeElementCreatedAt = new Date('2020-01-01'),
  latestCertificationDeliveredAt = new Date('2020-01-02'),
  latestBadgeAcquisitionUpdatedAt = new Date('2020-01-03'),
  latestComplementaryCertificationBadgeDetachedAt = new Date('2020-01-04'),
}) {
  return new UserCertificabilityCalculator({
    id,
    userId,
    certificability,
    certificabilityV2,
    latestKnowledgeElementCreatedAt,
    latestCertificationDeliveredAt,
    latestBadgeAcquisitionUpdatedAt,
    latestComplementaryCertificationBadgeDetachedAt,
  });
};

export { buildUserCertificabilityCalculator };
