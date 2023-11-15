import { expect, databaseBuilder, knex, sinon, catchErr } from '../../../test-helper.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { CertificationCenterInvitation } from '../../../../lib/domain/models/CertificationCenterInvitation.js';
import { mailService } from '../../../../lib/domain/services/mail-service.js';
import { SendingEmailError, SendingEmailToInvalidDomainError } from '../../../../lib/domain/errors.js';
import { EmailingAttempt } from '../../../../lib/domain/models/EmailingAttempt.js';

describe('Integration | UseCase | create-or-update-certification-center-invitation-for-admin', function () {
  let clock;
  const now = new Date('2022-09-25');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now: now.getTime(), toFake: ['Date'] });
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
    const result = await usecases.createOrUpdateCertificationCenterInvitationForAdmin({
      email,
      certificationCenterId,
      mailService,
      role: 'MEMBER',
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
      certificationCenterId,
      certificationCenterName: 'Centre des Pixous',
      updatedAt: now,
      role: 'MEMBER',
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
    const result = await usecases.createOrUpdateCertificationCenterInvitationForAdmin({
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
      role: 'MEMBER',
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
    await usecases.createOrUpdateCertificationCenterInvitationForAdmin({
      email,
      locale: 'en',
      role: 'MEMBER',
      certificationCenterId,
      mailService,
    });

    // then
    expect(mailService.sendCertificationCenterInvitationEmail).to.has.been.calledWithExactly({
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
    const role = null;

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
    const result = await catchErr(usecases.createOrUpdateCertificationCenterInvitationForAdmin)({
      email,
      locale: 'fr',
      certificationCenterId,
      mailService,
      role,
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
      const error = await catchErr(usecases.createOrUpdateCertificationCenterInvitationForAdmin)({
        email,
        locale: 'fr',
        role: 'ADMIN',
        certificationCenterId,
        mailService,
      });

      // then
      expect(error).to.be.an.instanceOf(SendingEmailToInvalidDomainError);
      expect(error.message).to.equal(
        'Failed to send email to hatake.kakashi@konoha.fire because domain seems to be invalid.',
      );
    });
  });
});
