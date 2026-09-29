import { expect } from 'chai';
import sinon from 'sinon';

import { SendingEmailToRefererError } from '../../../../../../src/certification/session-management/domain/errors.js';
import { sendCleaSessionResultsToReferers } from '../../../../../../src/certification/session-management/domain/usecases/send-session-results-to-referers.usecase.js';
import { EmailingAttempt } from '../../../../../../src/shared/mail/domain/models/EmailingAttempt.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | domain | usecases | send-session-results-to-referers', function () {
  describe('#sendCleaSessionResultsToReferers', function () {
    let sessionManagementRepository, certificationCenterRepository, mailService;
    beforeEach(function () {
      sessionManagementRepository = {
        get: sinon.stub(),
        hasSomeCleaAcquired: sinon.stub(),
      };
      certificationCenterRepository = {
        getRefererEmails: sinon.stub(),
      };
      mailService = {
        sendNotificationToCertificationCenterRefererForCleaResults: sinon.stub(),
      };
    });

    it('do nothing when session has no clea acquired results', async function () {
      const sessionId = 123;
      sessionManagementRepository.hasSomeCleaAcquired.withArgs({ id: sessionId }).returns(false);

      await sendCleaSessionResultsToReferers({
        sessionId,
        sessionManagementRepository,
        certificationCenterRepository,
        mailService,
      });

      expect(mailService.sendNotificationToCertificationCenterRefererForCleaResults).to.not.have.been.called;
    });

    it('do nothing without referer into this session', async function () {
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement();
      const sessionId = session.id;
      sessionManagementRepository.hasSomeCleaAcquired.withArgs({ id: sessionId }).returns(true);
      sessionManagementRepository.get.withArgs({ id: sessionId }).returns(session);
      certificationCenterRepository.getRefererEmails.withArgs({ id: session.certificationCenterId }).returns([]);

      await sendCleaSessionResultsToReferers({
        sessionId,
        sessionManagementRepository,
        certificationCenterRepository,
        mailService,
      });

      expect(mailService.sendNotificationToCertificationCenterRefererForCleaResults).to.not.have.been.called;
    });

    it('call mailService.sendNotificationToCertificationCenterRefererForCleaResults', async function () {
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement();
      const sessionId = session.id;
      sessionManagementRepository.hasSomeCleaAcquired.withArgs({ id: sessionId }).returns(true);
      sessionManagementRepository.get.withArgs({ id: sessionId }).returns(session);
      certificationCenterRepository.getRefererEmails
        .withArgs({ id: session.certificationCenterId })
        .returns([{ email: 'anEmail@example.com' }]);

      const emailAttempt = EmailingAttempt.success('anEmail@example.com');
      mailService.sendNotificationToCertificationCenterRefererForCleaResults.returns(emailAttempt);

      await sendCleaSessionResultsToReferers({
        sessionId,
        sessionManagementRepository,
        certificationCenterRepository,
        mailService,
      });

      expect(mailService.sendNotificationToCertificationCenterRefererForCleaResults).to.have.been.calledWithExactly({
        sessionId: session.id,
        email: 'anEmail@example.com',
        sessionDate: session.date,
      });
    });

    it('throw a SendingEmailToRefererError when something goes wrong with mailService', async function () {
      const session = domainBuilder.certification.sessionManagement.buildSessionManagement();
      const sessionId = session.id;
      sessionManagementRepository.hasSomeCleaAcquired.withArgs({ id: sessionId }).returns(true);
      sessionManagementRepository.get.withArgs({ id: sessionId }).returns(session);
      certificationCenterRepository.getRefererEmails
        .withArgs({ id: session.certificationCenterId })
        .returns([{ email: 'BADEMAIL@example@com' }]);

      const emailAttempt = EmailingAttempt.failure('BADEMAIL@example@com');
      mailService.sendNotificationToCertificationCenterRefererForCleaResults.returns(emailAttempt);

      const error = await catchErr(sendCleaSessionResultsToReferers)({
        sessionId,
        sessionManagementRepository,
        certificationCenterRepository,
        mailService,
      });

      expect(error).to.be.an.instanceof(SendingEmailToRefererError);
      expect(error.message).to.equal(
        "Échec lors de l'envoi du mail au(x) référent(s) du centre de certification : BADEMAIL@example@com",
      );
    });
  });
});
