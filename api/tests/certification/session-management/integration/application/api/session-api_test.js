import sinon from 'sinon';

import { onCertificationStartedOrResumed } from '../../../../../../src/certification/session-management/application/api/session-api.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session Management | Integration | Application | Api | Session', function () {
  describe('#onCertificationStartedOrResumed', function () {
    let clock;
    const now = new Date('2022-11-28T01:00:00Z');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('returns without altering any sessions when no session found for provided session id and without unauthorizing', async function () {
      // given
      domainBuilder.certification.sessionManagement
        .supervisedSessionBuilder()
        .withStartedCertifications({ count: 3, firstStartedCertificationId: 123 })
        .withParameters({ id: 2, date: '2020-01-01' })
        .insertToDB({ databaseBuilder });
      domainBuilder.certification.sessionManagement
        .supervisedCandidateBuilder()
        .asAuthorizedToStart({ authorizedAt: new Date('2020-02-02') })
        .inExistingSession({ sessionId: 2 })
        .withParameters({ id: 987 })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      // when
      await onCertificationStartedOrResumed({
        certificationId: 123,
        sessionId: 555,
        candidateId: 987,
        timezone: 'America/Catamarca',
      });

      // then
      const { date: sessionDate } = await knex('sessions').select('date').where('id', 2).first();
      const { authorizedToStartAt } = await knex('certification-candidates')
        .select('authorizedToStartAt')
        .where('id', 987)
        .first();
      expect(sessionDate).to.equal('2020-01-01');
      expect(authorizedToStartAt).to.deep.equal(new Date('2020-02-02'));
    });

    it('returns without altering the session when conditions were not reunited for date to be updated but still unauthorizing candidate', async function () {
      // given
      domainBuilder.certification.sessionManagement
        .supervisedSessionBuilder()
        .withStartedCertifications({ count: 3, firstStartedCertificationId: 123 })
        .withParameters({ id: 2, date: '2020-01-01' })
        .insertToDB({ databaseBuilder });
      domainBuilder.certification.sessionManagement
        .supervisedCandidateBuilder()
        .asAuthorizedToStart({ authorizedAt: new Date('2020-02-02') })
        .inExistingSession({ sessionId: 2 })
        .withParameters({ id: 987 })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      // when
      await onCertificationStartedOrResumed({
        certificationId: 555,
        sessionId: 2,
        candidateId: 987,
        timezone: 'America/Catamarca',
      });

      // then
      const { date: sessionDate } = await knex('sessions').select('date').where('id', 2).first();
      const { authorizedToStartAt } = await knex('certification-candidates')
        .select('authorizedToStartAt')
        .where('id', 987)
        .first();
      expect(sessionDate).to.equal('2020-01-01');
      expect(authorizedToStartAt).to.be.null;
    });

    it('returns and updated the session date when conditions are reunited for date to be updated and unauthorize candidate', async function () {
      // given
      domainBuilder.certification.sessionManagement
        .supervisedSessionBuilder()
        .withStartedCertifications({ count: 3, firstStartedCertificationId: 123 })
        .withParameters({ id: 2, date: '2020-01-01' })
        .insertToDB({ databaseBuilder });
      domainBuilder.certification.sessionManagement
        .supervisedCandidateBuilder()
        .asAuthorizedToStart({ authorizedAt: new Date('2020-02-02') })
        .inExistingSession({ sessionId: 2 })
        .withParameters({ id: 987 })
        .insertToDB({ databaseBuilder });
      await databaseBuilder.commit();

      // when
      await onCertificationStartedOrResumed({
        certificationId: 123,
        sessionId: 2,
        candidateId: 987,
        timezone: 'America/Catamarca',
      });

      // then
      const { date: sessionDate } = await knex('sessions').select('date').where('id', 2).first();
      const { authorizedToStartAt } = await knex('certification-candidates')
        .select('authorizedToStartAt')
        .where('id', 987)
        .first();
      expect(sessionDate).to.equal('2022-11-27');
      expect(authorizedToStartAt).to.be.null;
    });
  });
});
