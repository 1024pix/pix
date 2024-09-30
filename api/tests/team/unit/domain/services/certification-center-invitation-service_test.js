import {
  SendingEmailError,
  SendingEmailToInvalidDomainError,
  SendingEmailToInvalidEmailAddressError,
} from '../../../../../src/shared/domain/errors.js';
import { EmailingAttempt } from '../../../../../src/shared/domain/models/index.js';
import { CertificationCenterInvitation } from '../../../../../src/team/domain/models/CertificationCenterInvitation.js';
import {
  createOrUpdateCertificationCenterInvitation,
  resendCertificationCenterInvitation,
} from '../../../../../src/team/domain/services/certification-center-invitation-service.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Team | Domain | Services | CertificationCenterInvitationService', function () {
  describe('#createOrUpdateCertificationCenterInvitation', function () {
    let certificationCenterInvitationRepository;
    let mailService;

    beforeEach(function () {
      certificationCenterInvitationRepository = {
        create: sinon.stub(),
        findOnePendingByEmailAndCertificationCenterId: sinon.stub(),
        updateModificationDate: sinon.stub(),
      };
      mailService = {
        sendCertificationCenterInvitationEmail: sinon.stub(),
      };
    });

    context('success', function () {
      context('when invitation does not exist for an email', function () {
        it('creates an invitation, sends an email and updates invitation modification date', async function () {
          // given
          const certificationCenter = domainBuilder.buildCertificationCenter({
            name: 'Best Certification Center',
          });
          const code = 'AZERTY007';
          const email = 'dick.cionère@example.net';
          const locale = 'fr-fr';

          const certificationCenterInvitationToCreate = CertificationCenterInvitation.create({
            certificationCenterId: certificationCenter.id,
            code,
            email,
          });
          const createdCertificationCenterInvitation = new CertificationCenterInvitation({
            ...certificationCenterInvitationToCreate,
          });

          certificationCenterInvitationRepository.create.resolves(createdCertificationCenterInvitation);
          certificationCenterInvitationRepository.findOnePendingByEmailAndCertificationCenterId.resolves(null);
          sinon.stub(CertificationCenterInvitation, 'create').returns(certificationCenterInvitationToCreate);
          mailService.sendCertificationCenterInvitationEmail.resolves(EmailingAttempt.success(email));

          // when
          await createOrUpdateCertificationCenterInvitation({
            certificationCenterInvitationRepository,
            mailService,
          })({
            certificationCenter,
            email,
            locale,
          });

          // then
          expect(
            certificationCenterInvitationRepository.findOnePendingByEmailAndCertificationCenterId,
          ).to.have.been.calledWithExactly({
            certificationCenterId: certificationCenter.id,
            email,
          });
          expect(certificationCenterInvitationRepository.create).to.have.been.calledWithExactly(
            certificationCenterInvitationToCreate,
          );
          expect(mailService.sendCertificationCenterInvitationEmail).to.have.been.calledWithExactly({
            certificationCenterInvitationId: createdCertificationCenterInvitation.id,
            certificationCenterName: certificationCenter.name,
            code,
            email,
            locale,
          });
          expect(certificationCenterInvitationRepository.updateModificationDate).to.have.been.calledWith(
            createdCertificationCenterInvitation.id,
          );
        });
      });

      context('when an invitation exist for an email', function () {
        it('sends an email and updates invitation modification date', async function () {
          // given
          const certificationCenter = domainBuilder.buildCertificationCenter({
            name: 'Best Certification Center',
          });
          const code = 'AZERTY007';
          const email = 'dick.cionère@example.net';
          const locale = 'fr-fr';
          const certificationCenterInvitation = new CertificationCenterInvitation({
            certificationCenterId: certificationCenter.id,
            code,
            createdAt: new Date('2023-10-10'),
            email,
            updatedAt: new Date('2023-10-11'),
          });

          certificationCenterInvitationRepository.findOnePendingByEmailAndCertificationCenterId.resolves(
            certificationCenterInvitation,
          );
          mailService.sendCertificationCenterInvitationEmail.resolves(EmailingAttempt.success(email));

          // when
          await createOrUpdateCertificationCenterInvitation({
            certificationCenterInvitationRepository,
            mailService,
          })({
            certificationCenter,
            email,
            locale,
          });

          // then
          expect(mailService.sendCertificationCenterInvitationEmail).to.have.been.calledWithExactly({
            certificationCenterInvitationId: certificationCenterInvitation.id,
            certificationCenterName: certificationCenter.name,
            code,
            email,
            locale,
          });
          expect(certificationCenterInvitationRepository.updateModificationDate).to.have.been.calledWith(
            certificationCenterInvitation.id,
          );
        });
      });
    });

    context('failure', function () {
      context('when recipient email has an invalid domain', function () {
        it('throws a SendingEmailToInvalidDomainError', async function () {
          // given
          const emailWithInvalidDomain = 'someone@consideredInvalidDomain.net';
          const certificationCenter = domainBuilder.buildCertificationCenter({
            name: 'Best Certification Center',
          });
          const code = 'AZERTY005';
          const locale = 'fr-fr';
          const certificationCenterInvitation = new CertificationCenterInvitation({
            certificationCenterId: certificationCenter.id,
            code,
            createdAt: new Date('2023-10-10'),
            email: emailWithInvalidDomain,
            updatedAt: new Date('2023-10-11'),
          });

          certificationCenterInvitationRepository.findOnePendingByEmailAndCertificationCenterId.resolves(
            certificationCenterInvitation,
          );
          mailService.sendCertificationCenterInvitationEmail.resolves(
            EmailingAttempt.failure(emailWithInvalidDomain, EmailingAttempt.errorCode.INVALID_DOMAIN),
          );

          // when
          const error = await catchErr(
            createOrUpdateCertificationCenterInvitation({
              certificationCenterInvitationRepository,
              mailService,
            }),
          )({
            certificationCenter,
            email: emailWithInvalidDomain,
            locale,
          });

          // then
          expect(error).to.be.an.instanceOf(SendingEmailToInvalidDomainError);
          expect(error.message).to.equal(
            'Failed to send email to "someone@consideredInvalidDomain.net" because domain seems to be invalid.',
          );
        });
      });
    });

    context('when recipient email is invalid', function () {
      it('throws a SendingEmailToInvalidEmailAddressError', async function () {
        // given
        const invalidEmail = 'considered_invalid@example.net';
        const certificationCenter = domainBuilder.buildCertificationCenter({
          name: 'Best Certification Center',
        });
        const code = 'AZERTY006';
        const locale = 'fr-fr';
        const certificationCenterInvitation = new CertificationCenterInvitation({
          certificationCenterId: certificationCenter.id,
          code,
          createdAt: new Date('2023-10-10'),
          email: invalidEmail,
          updatedAt: new Date('2023-10-11'),
        });

        certificationCenterInvitationRepository.findOnePendingByEmailAndCertificationCenterId.resolves(
          certificationCenterInvitation,
        );
        mailService.sendCertificationCenterInvitationEmail.resolves(
          EmailingAttempt.failure(invalidEmail, EmailingAttempt.errorCode.INVALID_EMAIL),
        );

        // when
        const error = await catchErr(
          createOrUpdateCertificationCenterInvitation({
            certificationCenterInvitationRepository,
            mailService,
          }),
        )({
          certificationCenter,
          email: invalidEmail,
          locale,
        });

        // then
        expect(error).to.be.an.instanceOf(SendingEmailToInvalidEmailAddressError);
        expect(error.message).to.equal(
          'Failed to send email to "considered_invalid@example.net" because email address seems to be invalid.',
        );
      });
    });

    context('when email sending fails for some unknown reason', function () {
      it('throws a generic SendingEmailError', async function () {
        // given
        const certificationCenter = domainBuilder.buildCertificationCenter({
          name: 'Best Certification Center',
        });
        const code = 'AZERTY007';
        const email = 'dick.cionère@example.net';
        const locale = 'fr-fr';
        const certificationCenterInvitation = new CertificationCenterInvitation({
          certificationCenterId: certificationCenter.id,
          code,
          createdAt: new Date('2023-10-10'),
          email,
          updatedAt: new Date('2023-10-11'),
        });

        certificationCenterInvitationRepository.findOnePendingByEmailAndCertificationCenterId.resolves(
          certificationCenterInvitation,
        );
        mailService.sendCertificationCenterInvitationEmail.resolves(EmailingAttempt.failure(email));

        // when
        const error = await catchErr(
          createOrUpdateCertificationCenterInvitation({
            certificationCenterInvitationRepository,
            mailService,
          }),
        )({
          certificationCenter,
          email,
          locale,
        });

        // then
        expect(error).to.be.instanceOf(SendingEmailError);
        expect(error.message).to.equal('Failed to send email to "dick.cionère@example.net" for some unknown reason.');
      });
    });
  });

  describe('#resendCertificationCenterInvitation', function () {
    let certificationCenterInvitationRepository;
    let mailService;

    beforeEach(function () {
      certificationCenterInvitationRepository = {
        create: sinon.stub(),
        get: sinon.stub(),
        updateModificationDate: sinon.stub(),
      };
      mailService = {
        sendCertificationCenterInvitationEmail: sinon.stub(),
      };
    });

    context('success', function () {
      context('when an invitation is passed in parameter', function () {
        it('sends an email and updates invitation modification date', async function () {
          // given
          const certificationCenter = domainBuilder.buildCertificationCenter({
            name: 'Best Certification Center',
          });
          const code = 'AZERTY007';
          const email = 'dick.cionère@example.net';
          const locale = 'fr-fr';
          const certificationCenterInvitation = new CertificationCenterInvitation({
            certificationCenterId: certificationCenter.id,
            code,
            createdAt: new Date('2023-10-10'),
            email,
            updatedAt: new Date('2023-10-11'),
          });

          certificationCenterInvitationRepository.get.resolves(certificationCenterInvitation);
          mailService.sendCertificationCenterInvitationEmail.resolves(
            EmailingAttempt.success(certificationCenterInvitation.email),
          );

          // when
          await resendCertificationCenterInvitation({
            certificationCenterInvitationRepository,
            mailService,
          })({
            certificationCenter,
            certificationCenterInvitation,
            locale,
          });

          // then
          expect(mailService.sendCertificationCenterInvitationEmail).to.have.been.calledWithExactly({
            certificationCenterInvitationId: certificationCenterInvitation.id,
            certificationCenterName: certificationCenter.name,
            code,
            email,
            locale,
          });
          expect(certificationCenterInvitationRepository.updateModificationDate).to.have.been.calledWith(
            certificationCenterInvitation.id,
          );
        });
      });
    });
  });
});
