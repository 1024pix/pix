import { catchErr, expect, sinon } from '../../../test-helper.js';
import { config } from '../../../../lib/config.js';
import { auditLoggerRepository } from '../../../../lib/infrastructure/repositories/audit-logger-repository.js';
import { httpAgent } from '../../../../lib/infrastructure/http/http-agent.js';
import { AuditLoggerApiError } from '../../../../lib/domain/errors.js';

const { auditLogger } = config;

describe('Unit | Infrastructure | Repositories | audit-logger-repository', function () {
  let clock;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now: new Date('2023-08-18T08:31:21Z'), toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#logEvent', function () {
    context('success', function () {
      it('logs an event', async function () {
        // given
        const event = {
          userId: 1,
          targetUserId: 2,
          action: 'ANONYMIZATION',
          occurredAt: new Date(),
          role: 'SUPPORT',
          client: 'PIX_ADMIN',
        };
        const payload = event;
        const url = `${auditLogger.baseUrl}/api/audit-logs`;
        const headers = {
          Authorization: `Basic ${btoa(`pix-api:${auditLogger.clientSecret}`)}`,
        };
        sinon.stub(httpAgent, 'post').resolves({ isSuccessful: true, code: 204 });

        // when
        await auditLoggerRepository.logEvent(event);

        // then
        expect(httpAgent.post).to.have.been.calledWithExactly({ url, payload, headers });
      });
    });

    context('failure', function () {
      context('when response is not successful', function () {
        it('throws an error', async function () {
          // given
          const event = {
            userId: 1,
            targetUserId: 2,
            action: 'ANONYMIZATION',
            occurredAt: new Date(),
            role: 'SUPPORT',
            client: 'PIX_ADMIN',
          };
          sinon.stub(httpAgent, 'post').resolves({ code: 400, isSuccessful: false });

          // when
          const error = await catchErr(auditLoggerRepository.logEvent)(event);

          // then
          expect(error).to.be.instanceOf(AuditLoggerApiError);
          expect(error.message).to.equal('Pix Audit Logger Api answered with status 400');
        });
      });
    });
  });
});
