import sinon from 'sinon';

import * as eventAdapter from '../../../../../../src/certification/session-management/infrastructure/adapters/event-adapter.js';
import { EVENT_NAMES } from '../../../../../../src/certification/shared/domain/constants/event-names.js';

describe('Certification | SessionManagement | Unit | Adapter | event', function () {
  let eventApi, dependencies, clock;
  const now = new Date('2023-02-02');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    eventApi = {
      pushEvents: sinon.stub(),
    };
    eventApi.pushEvents.resolves();
    dependencies = {
      eventApi,
    };
  });

  afterEach(function () {
    clock.restore();
  });

  context('#onCandidateAuthorizedToStart', function () {
    it('send expected candidate data to event api', async function () {
      await eventAdapter.onCandidateAuthorizedToStart({
        candidateId: 123,
        authorizedToStartAt: new Date('2021-01-01'),
        dependencies,
      });

      sinon.assert.calledOnceWithExactly(eventApi.pushEvents, [
        {
          name: EVENT_NAMES.CANDIDATE_AUTHORIZED_TO_START,
          candidateId: 123,
          createdAt: now,
          metadata: {
            id: 123,
            authorizedToStartAt: new Date('2021-01-01'),
          },
        },
      ]);
    });
  });

  context('#onCandidateAuthorizedToResume', function () {
    it('send expected candidate data to event api', async function () {
      await eventAdapter.onCandidateAuthorizedToResume({
        candidateId: 123,
        authorizedToStartAt: new Date('2021-01-01'),
        dependencies,
      });

      sinon.assert.calledOnceWithExactly(eventApi.pushEvents, [
        {
          name: EVENT_NAMES.CANDIDATE_AUTHORIZED_TO_RESUME,
          candidateId: 123,
          createdAt: now,
          metadata: {
            id: 123,
            authorizedToStartAt: new Date('2021-01-01'),
          },
        },
      ]);
    });
  });

  context('#onCandidateUnauthorizedToStart', function () {
    it('send expected candidate data to event api', async function () {
      await eventAdapter.onCandidateUnauthorizedToStart({
        candidateId: 123,
        dependencies,
      });

      sinon.assert.calledOnceWithExactly(eventApi.pushEvents, [
        {
          name: EVENT_NAMES.CANDIDATE_UNAUTHORIZED_TO_START,
          candidateId: 123,
          createdAt: now,
          metadata: {
            id: 123,
            authorizedToStartAt: null,
          },
        },
      ]);
    });
  });
});
