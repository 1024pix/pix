import { expect, databaseBuilder } from '../../../test-helper';
import useCases from '../../../../lib/domain/usecases';
import CertificationCenterInvitation from '../../../../lib/domain/models/CertificationCenterInvitation';

describe('Integration | UseCase | find-pending-certification-center-invitations', function () {
  it('should find only pending certification center invitations for a given certification center', async function () {
    // given
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    const otherCertificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;

    const now = new Date();
    const certificationCenterInvitation1 = databaseBuilder.factory.buildCertificationCenterInvitation({
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.PENDING,
      email: 'alex.terieur@example.net',
      updatedAt: now,
    });
    const certificationCenterInvitation2 = databaseBuilder.factory.buildCertificationCenterInvitation({
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.PENDING,
      email: 'sarah.pelle@example.net',
      updatedAt: now,
    });

    databaseBuilder.factory.buildCertificationCenterInvitation({
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.ACCEPTED,
    });
    databaseBuilder.factory.buildCertificationCenterInvitation({
      certificationCenterId: otherCertificationCenterId,
      status: CertificationCenterInvitation.StatusType.PENDING,
    });
    await databaseBuilder.commit();

    // when
    const certificationCenterInvitations = await useCases.findPendingCertificationCenterInvitations({
      certificationCenterId,
    });

    // then
    expect(certificationCenterInvitations.length).to.equal(2);
    expect(certificationCenterInvitations[0]).to.be.instanceOf(CertificationCenterInvitation);
    expect(certificationCenterInvitations[0]).to.deep.include({
      id: certificationCenterInvitation1.id,
      certificationCenterId,
      email: 'alex.terieur@example.net',
      updatedAt: now,
    });
    expect(certificationCenterInvitations[1]).to.deep.include({
      id: certificationCenterInvitation2.id,
      certificationCenterId,
      email: 'sarah.pelle@example.net',
      updatedAt: now,
    });
  });

  it('should return pending certification center invitations sorted by updatedAt', async function () {
    // given
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    const oldestInvitationUpdatedAt = new Date('2022-06-10');
    const latestInvitationUpdatedAt = new Date('2024-10-15');

    databaseBuilder.factory.buildCertificationCenterInvitation({
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.PENDING,
      email: 'alex.terieur@example.net',
      updatedAt: new Date('2022-06-10'),
    });
    databaseBuilder.factory.buildCertificationCenterInvitation({
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.PENDING,
      email: 'sarah.pelle@example.net',
      updatedAt: oldestInvitationUpdatedAt,
    });
    databaseBuilder.factory.buildCertificationCenterInvitation({
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.PENDING,
      email: 'sarah.pelle@example.net',
      updatedAt: latestInvitationUpdatedAt,
    });
    databaseBuilder.factory.buildCertificationCenterInvitation({
      certificationCenterId,
      status: CertificationCenterInvitation.StatusType.PENDING,
      email: 'amede.bu@example.net',
      updatedAt: new Date('2023-12-15'),
    });

    await databaseBuilder.commit();

    // when
    const certificationCenterInvitations = await useCases.findPendingCertificationCenterInvitations({
      certificationCenterId,
    });

    // then
    expect(certificationCenterInvitations[0].email).to.equal('sarah.pelle@example.net');
    expect(certificationCenterInvitations[0].updatedAt).to.deep.equal(latestInvitationUpdatedAt);
    expect(certificationCenterInvitations[1].email).to.equal('amede.bu@example.net');
    expect(certificationCenterInvitations[2].email).to.equal('alex.terieur@example.net');
    expect(certificationCenterInvitations[3].email).to.equal('sarah.pelle@example.net');
    expect(certificationCenterInvitations[3].updatedAt).to.deep.equal(oldestInvitationUpdatedAt);
  });

  it('should return an empty list on no result', async function () {
    // given
    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    await databaseBuilder.commit();

    // when
    const certificationCenterInvitations = await useCases.findPendingCertificationCenterInvitations({
      certificationCenterId,
    });

    // then
    expect(certificationCenterInvitations).to.deep.equal([]);
  });
});
