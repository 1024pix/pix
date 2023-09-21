import { sinon, expect } from '../../../../../test-helper.js';

import * as mailService from '../../../../../../src/certification/shared/domain/services/mail-service.js';
import { mailer } from '../../../../../../src/shared/mail/infrastructure/services/mailer.js';

describe('Unit | Service | Certification | MailService', function () {
  const senderEmailAddress = 'ne-pas-repondre@pix.fr';
  const userEmailAddress = 'user@example.net';

  beforeEach(function () {
    sinon.stub(mailer, 'sendEmail').resolves();
  });

  describe('#sendNotificationToOrganizationMembersForTargetProfileDetached', function () {
    it(`should call sendEmail with the right options`, async function () {
      // given
      const email = userEmailAddress;
      const complementaryCertificationName = 'what a complementary';

      // when
      await mailService.sendNotificationToOrganizationMembersForTargetProfileDetached({
        email,
        complementaryCertificationName,
      });

      // then
      expect(mailer.sendEmail).to.have.been.calledWith({
        from: senderEmailAddress,
        fromName: 'PIX - Ne pas répondre',
        to: email,
        template: mailer.targetProfileNotCertifiableTemplateId,
        variables: { complementaryCertificationName },
      });
    });
  });
});
