import sinon from 'sinon';

import * as sessionAdapter from '../../../../../../src/certification/evaluation/infrastructure/adapters/session-adapter.js';

describe('Certification | Evaluation | Unit | Adapter | Session', function () {
  let sessionApi, dependencies;

  beforeEach(function () {
    sessionApi = {
      onCertificationStartedOrResumed: sinon.stub(),
    };

    dependencies = {
      sessionApi,
    };
  });

  describe('#onCertificationStartedOrResumed', function () {
    it('calls the API with the right attributes', async function () {
      sessionApi.onCertificationStartedOrResumed.resolves(null);

      await sessionAdapter.onCertificationStartedOrResumed({
        certificationId: 123,
        sessionId: 456,
        candidateId: 789,
        timezone: 'Europe/London',
        dependencies,
      });

      sinon.assert.calledWith(sessionApi.onCertificationStartedOrResumed, {
        certificationId: 123,
        sessionId: 456,
        candidateId: 789,
        timezone: 'Europe/London',
      });
    });
  });
});
