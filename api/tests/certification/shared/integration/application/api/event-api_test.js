import sinon from 'sinon';

import {
  pushCandidateEnrolledEvent,
  pushMultipleCandidatesEnrolledEvent,
} from '../../../../../../src/certification/shared/application/api/event-api.js';
import { knex } from '../../../../../tooling/databases.js';

describe('Certification | Shared | Integration | Application | API | Event', function () {
  let clock;
  const now = new Date('2023-02-02T00:00:00Z');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
    return knex('certification_events').truncate();
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
          },
        },
      ]);
    });
  });

  describe('#pushMultipleCandidatesEnrolledEvent', function () {
    it('persists several CandidateEnrolledEvents', async function () {
      const data1 = {
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
      const data2 = {
        id: 111,
        firstName: 'foo firstName2',
        lastName: 'foo lastName2',
        sex: 'foo sex2',
        birthPostalCode: 'foo birthPostalCode2',
        birthINSEECode: 'foo birthINSEECode2',
        birthCity: 'foo birthCity2',
        birthProvinceCode: 'foo birthProvinceCode2',
        birthCountry: 'foo birthCountry2',
        email: 'foo email2',
        resultRecipientEmail: 'foo resultRecipientEmail2',
        externalId: 'foo externalId2',
        birthdate: '2019-09-09',
        extraTimePercentage: 222,
        billingMode: 'foo billingMode2',
        prepaymentCode: 'foo prepaymentCode2',
        subscription: 'foo subscription2',
        accessibilityAdjustmentNeeded: false,
        sessionId: 333,
        organizationLearnerId: null,
      };

      await pushMultipleCandidatesEnrolledEvent([data1, data2]);

      // then
      const events = await knex('certification_events').select();
      sinon.assert.match(events, [
        {
          id: sinon.match.number,
          eventName: 'CandidateEnrolledEvent',
          candidateId: 123,
          createdAt: new Date('2023-02-02T00:00:00Z'),
          metadata: {
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
          },
        },
        {
          id: sinon.match.number,
          eventName: 'CandidateEnrolledEvent',
          candidateId: 111,
          createdAt: new Date('2023-02-02T00:00:00Z'),
          metadata: {
            id: 111,
            firstName: 'foo firstName2',
            lastName: 'foo lastName2',
            sex: 'foo sex2',
            birthPostalCode: 'foo birthPostalCode2',
            birthINSEECode: 'foo birthINSEECode2',
            birthCity: 'foo birthCity2',
            birthProvinceCode: 'foo birthProvinceCode2',
            birthCountry: 'foo birthCountry2',
            email: 'foo email2',
            resultRecipientEmail: 'foo resultRecipientEmail2',
            externalId: 'foo externalId2',
            birthdate: '2019-09-09',
            extraTimePercentage: 222,
            billingMode: 'foo billingMode2',
            prepaymentCode: 'foo prepaymentCode2',
            subscription: 'foo subscription2',
            accessibilityAdjustmentNeeded: false,
            sessionId: 333,
            organizationLearnerId: null,
          },
        },
      ]);
    });
  });
});
