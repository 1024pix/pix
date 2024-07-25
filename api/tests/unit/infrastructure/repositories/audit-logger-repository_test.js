import { httpAgent } from '../../../../lib/infrastructure/http/http-agent.js';
import { auditLoggerRepository } from '../../../../lib/infrastructure/repositories/audit-logger-repository.js';
import { config } from '../../../../src/shared/config.js';
import { AuditLoggerApiError } from '../../../../src/shared/domain/errors.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

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

  describe('#logEvents', function () {
    context('success', function () {
      it('logs multiple events', async function () {
        // given
        const payload = [
          {
            userId: 1,
            targetUserId: 2,
            action: 'ANONYMIZATION',
            occurredAt: new Date(),
            role: 'SUPPORT',
            client: 'PIX_ADMIN',
          },
          {
            userId: 1,
            targetUserId: 2,
            action: 'ANONYMIZATION',
            occurredAt: new Date(),
            role: 'SUPPORT',
            client: 'PIX_ADMIN',
          },
        ];
        const url = `${auditLogger.baseUrl}/api/audit-logs`;
        const headers = {
          Authorization: `Basic ${btoa(`pix-api:${auditLogger.clientSecret}`)}`,
        };
        sinon.stub(httpAgent, 'post').resolves({ isSuccessful: true, code: 204 });

        // when
        await auditLoggerRepository.logEvents(payload);

        // then
        expect(httpAgent.post).to.have.been.calledWithExactly({ url, payload, headers });
      });
    });

    context('failure', function () {
      context('when response is not successful', function () {
        it('throws an error', async function () {
          // given
          const payload = [
            {
              userId: 1,
              targetUserId: 2,
              action: 'ANONYMIZATION',
              occurredAt: new Date(),
              role: 'SUPPORT',
              client: 'PIX_ADMIN',
            },
            {
              userId: 1,
              targetUserId: 2,
              action: 'ANONYMIZATION',
              occurredAt: new Date(),
              role: 'SUPPORT',
              client: 'PIX_ADMIN',
            },
          ];
          sinon.stub(httpAgent, 'post').resolves({ code: 400, isSuccessful: false });

          // when
          const error = await catchErr(auditLoggerRepository.logEvent)(payload);

          // then
          expect(error).to.be.instanceOf(AuditLoggerApiError);
          expect(error.message).to.equal('Pix Audit Logger Api answered with status 400');
        });
      });
    });
  });
});
