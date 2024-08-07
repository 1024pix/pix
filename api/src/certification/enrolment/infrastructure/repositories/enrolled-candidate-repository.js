import { knex } from '../../../../../db/knex-database-connection.js';
import { Subscription } from '../../domain/models/Subscription.js';
import { EnrolledCandidate } from '../../domain/read-models/EnrolledCandidate.js';

const findBySessionId = async function ({ sessionId }) {
  const candidatesData = await knex
    .select('certification-candidates.*')
    .select({
      subscriptions: knex.raw(
        `json_agg(
          json_build_object(
            'type', "certification-subscriptions"."type",
            'complementaryCertificationId', "certification-subscriptions"."complementaryCertificationId",
            'certificationCandidateId', "certification-candidates"."id"
          )
      )`,
      ),
    })
    .from('certification-candidates')
    .where({ 'certification-candidates.sessionId': sessionId })
    .join(
      'certification-subscriptions',
      'certification-subscriptions.certificationCandidateId',
      'certification-candidates.id',
    )
    .groupBy('certification-candidates.id');

  const enrolledCandidates = candidatesData.map((candidateData) => {
    const subscriptions = candidateData.subscriptions.map((subscription) => new Subscription(subscription));
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
