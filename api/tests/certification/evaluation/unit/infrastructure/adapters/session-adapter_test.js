import sinon from 'sinon';

import * as sessionAdapter from '../../../../../../src/certification/evaluation/infrastructure/adapters/session-adapter.js';

describe('Certification | Evaluation | Unit | Adapter | Session', function () {
  let sessionApi, dependencies;

  beforeEach(function () {
    sessionApi = {
      onCertificationStarted: sinon.stub(),
    };

    dependencies = {
      sessionApi,
    };
  });

  describe('#onCertificationStarted', function () {
    it('calls the API with the right attributes', async function () {
      sessionApi.onCertificationStarted.resolves(null);

      await sessionAdapter.onCertificationStarted({
        certificationId: 123,
        sessionId: 456,
        candidateId: 789,
        timezone: 'Europe/London',
        dependencies,
      });

      sinon.assert.calledWith(sessionApi.onCertificationStarted, {
        certificationId: 123,
        sessionId: 456,
        candidateId: 789,
        timezone: 'Europe/London',
      });
    });
  });
});
