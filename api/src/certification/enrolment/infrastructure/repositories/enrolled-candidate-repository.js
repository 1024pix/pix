import { knex } from '../../../../../db/knex-database-connection.js';
import { SubscriptionTypes } from '../../../shared/domain/models/SubscriptionTypes.js';
import { EnrolledCandidate } from '../../domain/read-models/EnrolledCandidate.js';

const findBySessionId = async function ({ sessionId }) {
  const candidatesData = await knex
    .distinct('certification-candidates.id')
    .select({ certificationCandidate: 'certification-candidates.*' })
    .select(
      knex.raw(
        `ARRAY_AGG(
          "certification-subscriptions"."type" || ',' ||
          COALESCE("complementary-certifications"."id", -1) || ',' ||
          COALESCE("complementary-certifications"."label", '') || ',' ||
          COALESCE("complementary-certifications"."key", '')
          ) OVER (PARTITION BY "certification-candidates"."id") as subscriptions
          `,
      ),
    )
    .from('certification-candidates')
    .where({ 'certification-candidates.sessionId': sessionId })
    .join(
      'certification-subscriptions',
      'certification-subscriptions.certificationCandidateId',
      'certification-candidates.id',
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'certification-subscriptions.complementaryCertificationId',
    );

  const enrolledCandidates = candidatesData.map((candidateData) => {
    const subscriptions = candidateData.subscriptions.map((subscription) => {
      const subscriptionInfo = subscription.split(',');
      if (subscriptionInfo[0] === SubscriptionTypes.CORE)
        return {
          complementaryCertificationId: null,
          complementaryCertificationLabel: null,
          complementaryCertificationKey: null,
          type: SubscriptionTypes.CORE,
        };
      return {
        complementaryCertificationId: parseInt(subscriptionInfo[1]),
        complementaryCertificationLabel: subscriptionInfo[2],
        complementaryCertificationKey: subscriptionInfo[3],
        type: SubscriptionTypes.COMPLEMENTARY,
      };
    });
    return new EnrolledCandidate({
      ...candidateData,
      subscriptions,
    });
  });
  return enrolledCandidates.sort(_sortAlphabeticallyByLastNameThenFirstName);
};

function _sortAlphabeticallyByLastNameThenFirstName(
  { firstName: firstName1, lastName: lastName1 },
  { firstName: firstName2, lastName: lastName2 },
) {
  let compareRes = lastName1.localeCompare(lastName2);
  if (compareRes === 0) compareRes = firstName1.localeCompare(firstName2);
  return compareRes;
}
export { findBySessionId };
