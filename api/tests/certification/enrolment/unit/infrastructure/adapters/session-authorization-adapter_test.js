import sinon from 'sinon';

import * as sessionAuthorizationAdapter from '../../../../../../src/certification/enrolment/infrastructure/adapters/session-authorization-adapter.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Evaluation | Unit | Adapter | Session authorization', function () {
  let sessionAuthorizationApi, dependencies;

  beforeEach(function () {
    sessionAuthorizationApi = {
      findBySessionId: sinon.stub(),
    };

    dependencies = {
      sessionAuthorizationApi,
    };
  });

  context('#find', function () {
    context('when session authorization not found', function () {
      it('returns null', async function () {
        sessionAuthorizationApi.findBySessionId.withArgs({ sessionId: 456 }).resolves(null);

        const sessionAuth = await sessionAuthorizationAdapter.find({
          sessionId: 456,
          dependencies,
        });

        expect(sessionAuth).to.be.null;
      });
    });

    context('when session authorization is found', function () {
      it('returns expected SessionAuthorization', async function () {
        sessionAuthorizationApi.findBySessionId.withArgs({ sessionId: 456 }).resolves({
          id: 456,
          isFinalized: true,
          hasExpired: true,
        });

        const sessionAuthorization = await sessionAuthorizationAdapter.find({
          sessionId: 456,
          dependencies,
        });

        expect(sessionAuthorization).to.deepEqualInstance(
          domainBuilder.certification.enrolment
            .sessionAuthorizationBuilder()
            .withParameters({ id: 456, isFinalized: true, hasExpired: true })
            .build(),
        );
      });
    });
  });
});
