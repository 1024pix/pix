const { expect, databaseBuilder, knex, sinon, catchErr } = require('../../../test-helper');
const useCases = require('../../../../lib/domain/usecases');
const CertificationCenterInvitation = require('../../../../lib/domain/models/CertificationCenterInvitation');
const mailService = require('../../../../lib/domain/services/mail-service');
const { SendingEmailError, SendingEmailToInvalidDomainError } = require('../../../../lib/domain/errors');
const EmailingAttempt = require('../../../../lib/domain/models/EmailingAttempt');

describe('Integration | UseCase | create-or-update-certification-center-invitation-for-admin', function () {
  let clock;
  const now = new Date('2022-09-25');

  beforeEach(function () {
    clock = sinon.useFakeTimers(now.getTime());
    sinon.stub(mailService, 'sendCertificationCenterInvitationEmail');
  });

  afterEach(async function () {
    clock.restore();
  });

  it('should create a new invitation if there isn’t an already pending existing one with given email', async function () {
    // given
    const email = 'some.user@example.net';
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: 'Centre des Pixous' }).id;

    databaseBuilder.factory.buildCertificationCenterInvitation({
      email: 'another.user@example.net',
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.PENDING,
      updatedAt: new Date('2022-04-04'),
    });
    databaseBuilder.factory.buildCertificationCenterInvitation({
      email,
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.CANCELLED,
      updatedAt: new Date('2000-03-03'),
    }).id;

    await databaseBuilder.commit();

    // when
    const result = await useCases.createOrUpdateCertificationCenterInvitationForAdmin({
      email,
      certificationCenterId,
      mailService,
    });

    // then
    const allInvitations = await knex('certification-center-invitations').select('*');
    expect(allInvitations).to.have.length(3);

    expect(result.isInvitationCreated).to.be.true;
    expect(result.certificationCenterInvitation).to.be.instanceOf(CertificationCenterInvitation);
    const newAddedInvitation = await knex('certification-center-invitations')
      .select('*')
      .where({ email, status: CertificationCenterInvitation.StatusType.PENDING })
      .first();
    expect(result.certificationCenterInvitation).to.deep.include({
      id: newAddedInvitation.id,
      email,
      certificationCenterName: 'Centre des Pixous',
      updatedAt: now,
    });
    expect(result.certificationCenterInvitation.code).to.exist;
  });

  it('should update an already existing pending invitation’s', async function () {
    // given
    const email = 'some.user@example.net';
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: 'Centre Pixou' }).id;

    const someTimeInThePastDate = new Date('2019-03-12T01:02:03Z');
    const existingPendingInvitationId = databaseBuilder.factory.buildCertificationCenterInvitation({
      email,
      code: 'AAALLLPPP1',
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.PENDING,
      updatedAt: someTimeInThePastDate,
    }).id;

    await databaseBuilder.commit();

    // when
    const result = await useCases.createOrUpdateCertificationCenterInvitationForAdmin({
      email,
      certificationCenterId,
      mailService,
    });

    // then
    const allInvitations = await knex('certification-center-invitations').select('*');
    expect(allInvitations).to.have.length(1);

    expect(result.isInvitationCreated).to.be.false;
    expect(result.certificationCenterInvitation).to.be.instanceOf(CertificationCenterInvitation);
    expect(result.certificationCenterInvitation).to.deep.include({
      id: existingPendingInvitationId,
      email,
      certificationCenterName: 'Centre Pixou',
      updatedAt: now,
      code: 'AAALLLPPP1',
    });
  });

  it('should send email by calling mail service', async function () {
    // given
    const email = 'some.user@example.net';

    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: 'Pixar' }).id;
    const certificationCenterInvitationId = databaseBuilder.factory.buildCertificationCenterInvitation({
      email,
      certificationCenterId,
      code: 'BBBJJJPPP3',
      status: CertificationCenterInvitation.StatusType.PENDING,
    }).id;
    await databaseBuilder.commit();

    // when
    await useCases.createOrUpdateCertificationCenterInvitationForAdmin({
      email,
      locale: 'en',
      certificationCenterId,
      mailService,
    });

    // then
    expect(mailService.sendCertificationCenterInvitationEmail).to.has.been.calledWith({
      email: 'some.user@example.net',
      certificationCenterName: 'Pixar',
      certificationCenterInvitationId,
      code: 'BBBJJJPPP3',
      locale: 'en',
    });
  });

  it('should throw an error if email was not send', async function () {
    // given
    const email = 'some.user@example.net';

    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: 'Pixar' }).id;
    databaseBuilder.factory.buildCertificationCenterInvitation({
      email,
      certificationCenterId,
      code: 'BBBJJJPPP3',
      status: CertificationCenterInvitation.StatusType.PENDING,
    }).id;
    await databaseBuilder.commit();

    const mailerResponse = EmailingAttempt.failure(email);
    mailService.sendCertificationCenterInvitationEmail.resolves(mailerResponse);

    // when
    const result = await catchErr(useCases.createOrUpdateCertificationCenterInvitationForAdmin)({
      email,
      locale: 'fr',
      certificationCenterId,
      mailService,
    });

    // then
    expect(result).to.be.an.instanceOf(SendingEmailError);
  });

  context('when recipient email has an invalid domain', function () {
    it('throw a SendingEmailToInvalidDomainError error', async function () {
      // given
      const email = 'hatake.kakashi@konoha.fire';
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ name: 'Konoha' }).id;
      databaseBuilder.factory.buildCertificationCenterInvitation({
        email,
        certificationCenterId,
        code: 'NUSUSHKH7',
        status: CertificationCenterInvitation.StatusType.PENDING,
      });
      await databaseBuilder.commit();
      const emailAttemptFailure = EmailingAttempt.failure(email, EmailingAttempt.errorCode.INVALID_DOMAIN);
      mailService.sendCertificationCenterInvitationEmail.resolves(emailAttemptFailure);

      // when
      const error = await catchErr(useCases.createOrUpdateCertificationCenterInvitationForAdmin)({
        email,
        locale: 'fr',
        certificationCenterId,
        mailService,
      });

      // then
      expect(error).to.be.an.instanceOf(SendingEmailToInvalidDomainError);
      expect(error.message).to.equal(
        'Failed to send email to hatake.kakashi@konoha.fire because domain seems to be invalid.'
      );
    });
  });
});
