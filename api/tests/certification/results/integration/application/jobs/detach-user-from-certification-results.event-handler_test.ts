import { expect } from 'chai';
import type { Knex } from 'knex';

import { DetachUserFromCertificationResultsEventHandler } from '../../../../../../src/certification/results/application/jobs/detach-user-from-certification-results.event-handler.ts';
import { AnonymizeUserEvent } from '../../../../../../src/shared/domain/events/AnonymizeUserEvent.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';

describe('Certification | Results | Integration | Application | Jobs | detach-user-from-certification-results', function () {
  const knexConn = knex as Knex;

  it('listens to the user anonymization event', function () {
    // when
    const handler = new DetachUserFromCertificationResultsEventHandler();

    // then
    expect(handler.eventName).to.equal(AnonymizeUserEvent.eventName);
  });

  describe('#handle', function () {
    it('removes the link between the anonymized user and their certification results', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const updatedByUserId = databaseBuilder.factory.buildUser().id;
      const certificationResultId = databaseBuilder.factory.buildCertificationResult().id;
      databaseBuilder.factory.buildUserCertificationResult({ certificationResultId, userId });
      await databaseBuilder.commit();
      const event = new AnonymizeUserEvent({ userId, updatedByUserId });

      // when
      const handler = new DetachUserFromCertificationResultsEventHandler();
      await handler.handle({ data: event.payload });

      // then
      const userCertificationResult = await knexConn<{ certificationResultId: string; userId: number | null }>(
        'user_certification_results',
      )
        .select('userId')
        .where({ certificationResultId })
        .first();
      expect(userCertificationResult).to.deep.equal({ userId: null });
    });
  });
});
