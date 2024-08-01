import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { EnrolledCandidate } from '../../domain/read-models/EnrolledCandidate.js';

const findBySessionId = async function ({ sessionId }) {
  const candidatesData = await knex
    .distinct('certification-candidates.id')
    .select({ certificationCandidate: 'certification-candidates.*' })
    .select(
      knex.raw(
        'ARRAY_AGG("complementary-certifications"."id" || \',\' || "complementary-certifications"."label" || \',\' ||"complementary-certifications"."key") OVER (PARTITION BY "certification-candidates"."id") as subscriptions',
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
    const subscriptions = _.compact(
      _.map(candidateData.subscriptions, (subscription) => {
        if (!subscription) return null;
        return {
          complementaryCertificationId: parseInt(subscription.split(',')[0]),
          complementaryCertificationLabel: subscription.split(',')[1],
          complementaryCertificationKey: subscription.split(',')[2],
        };
      }),
    );
    delete candidateData.subscriptions;
    return new EnrolledCandidate({
      ...candidateData,
      isLinked: candidateData.userId !== null,
      complementaryCertificationId: subscriptions?.[0]?.complementaryCertificationId ?? null,
      complementaryCertificationLabel: subscriptions?.[0]?.complementaryCertificationLabel ?? null,
      complementaryCertificationKey: subscriptions?.[0]?.complementaryCertificationKey ?? null,
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
