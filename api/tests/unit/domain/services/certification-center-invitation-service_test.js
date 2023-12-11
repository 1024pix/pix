import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';
import {
  createOrUpdateCertificationCenterInvitation,
  resendCertificationCenterInvitation,
} from '../../../../lib/domain/services/certification-center-invitation-service.js';
import { CertificationCenterInvitation, EmailingAttempt } from '../../../../lib/domain/models/index.js';
import { SendingEmailError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Services | CertificationCenterInvitationService', function () {
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
            id: 202310130,
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
            id: 202310131,
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
            id: 202310130,
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
            id: 202310131,
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
      context('when an error occurs', function () {
        it('throws an error', async function () {
          // given
          const certificationCenter = domainBuilder.buildCertificationCenter({
            id: 202310130,
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
            id: 202310131,
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
        });
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
            id: 202310130,
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
            id: 202310131,
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
