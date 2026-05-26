import sinon from 'sinon';

import { pushCandidateEnrolledEvent } from '../../../../../../src/certification/shared/application/api/event-api.js';
import { knex } from '../../../../../tooling/databases.js';

describe('Certification | Shared | Integration | Application | API | Event', function () {
  let clock;
  const now = new Date('2023-02-02T00:00:00Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#pushCandidateEnrolledEvent', function () {
    it('persists a CandidateEnrolledEvent', async function () {
      const data = {
        id: 123,
        firstName: 'foo firstName',
        lastName: 'foo lastName',
        sex: 'foo sex',
        birthPostalCode: 'foo birthPostalCode',
        birthINSEECode: 'foo birthINSEECode',
        birthCity: 'foo birthCity',
        birthProvinceCode: 'foo birthProvinceCode',
        birthCountry: 'foo birthCountry',
        email: 'foo email',
        resultRecipientEmail: 'foo resultRecipientEmail',
        externalId: 'foo externalId',
        birthdate: '2020-01-01',
        extraTimePercentage: 456,
        billingMode: 'foo billingMode',
        prepaymentCode: 'foo prepaymentCode',
        subscription: 'foo subscription',
        accessibilityAdjustmentNeeded: true,
        sessionId: 789,
        organizationLearnerId: 159,
      };

      await pushCandidateEnrolledEvent(data);

      // then
      const events = await knex('certification_events').select();
      sinon.assert.match(events, [
        {
          id: sinon.match.number,
          eventName: 'CandidateEnrolledEvent',
          candidateId: 123,
          createdAt: new Date('2023-02-02T00:00:00Z'),
          metadata: {
            firstName: 'foo firstName',
            lastName: 'foo lastName',
            sex: 'foo sex',
            birthPostalCode: 'foo birthPostalCode',
            birthINSEECode: 'foo birthINSEECode',
            birthCity: 'foo birthCity',
            birthProvinceCode: 'foo birthProvinceCode',
            birthCountry: 'foo birthCountry',
            email: 'foo email',
            resultRecipientEmail: 'foo resultRecipientEmail',
            externalId: 'foo externalId',
            birthdate: '2020-01-01',
            extraTimePercentage: 456,
            billingMode: 'foo billingMode',
            prepaymentCode: 'foo prepaymentCode',
            subscription: 'foo subscription',
            accessibilityAdjustmentNeeded: true,
            sessionId: 789,
            organizationLearnerId: 159,
          },
        },
      ]);
    });
  });
});
