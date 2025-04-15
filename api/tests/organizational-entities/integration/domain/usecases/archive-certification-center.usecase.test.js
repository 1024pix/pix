import { knex } from '../../../../../db/knex-database-connection.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { CertificationCenterInvitation } from '../../../../../src/team/domain/models/CertificationCenterInvitation.js';
import { databaseBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Integration | Organizational Entities | Domain | UseCase | archive-certification-center', function () {
  it('archives the certification center and related data', async function () {
    // given
    const creationDate = new Date(2021, 1, 1);
    const lastUpdateBeforeArchive = new Date(2022, 2, 2);
    const now = new Date(2023, 3, 3);
    const clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    const pendingStatus = CertificationCenterInvitation.StatusType.PENDING;
    const superAdminUser = databaseBuilder.factory.buildUser();
    const user = databaseBuilder.factory.buildUser({});

    const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
      updatedAt: lastUpdateBeforeArchive,
      createdAt: creationDate,
    });

    databaseBuilder.factory.buildCertificationCenterMembership({
      certificationCenterId: certificationCenter.id,
      userId: user.id,
      createdAt: creationDate,
      updatedAt: lastUpdateBeforeArchive,
    });

    databaseBuilder.factory.buildCertificationCenterInvitation({
      certificationCenterId: certificationCenter.id,
      email: user.email,
      status: pendingStatus,
    });

    await databaseBuilder.commit();

    // when
    await usecases.archiveCertificationCenter({
      certificationCenterId: certificationCenter.id,
      userId: superAdminUser.id,
    });
    const archivedCertificationCenter = await knex('certification-centers')
      .where({ id: certificationCenter.id })
      .first();
    const disabledCertificationCenterMembership = await knex('certification-center-memberships')
      .where({ certificationCenterId: certificationCenter.id })
      .first();
    const cancelledCertificationCenterInvitation = await knex('certification-center-invitations')
      .where({ certificationCenterId: certificationCenter.id })
      .first();

    // then
    expect(archivedCertificationCenter.archivedAt).to.deep.equal(now);
    expect(archivedCertificationCenter.archivedBy).to.deep.equal(superAdminUser.id);
    expect(archivedCertificationCenter.updatedAt).to.deep.equal(lastUpdateBeforeArchive);

    expect(disabledCertificationCenterMembership.disabledAt).to.deep.equal(now);
    expect(disabledCertificationCenterMembership.updatedByUserId).to.deep.equal(superAdminUser.id);
    expect(disabledCertificationCenterMembership.updatedAt).to.deep.equal(lastUpdateBeforeArchive);

    expect(cancelledCertificationCenterInvitation.status).to.deep.equal('cancelled');
    expect(cancelledCertificationCenterInvitation.updatedAt).to.deep.equal(now);

    clock.restore();
  });

  it('throws an error if certification center does not exist', async function () {
    // given
    const certificationCenterId = 1234;
    const superAdminUser = databaseBuilder.factory.buildUser();
    await databaseBuilder.commit();

    // when /then
    await expect(
      usecases.archiveCertificationCenter({
        certificationCenterId,
        userId: superAdminUser.id,
      }),
    ).to.be.rejectedWith(NotFoundError);
  });
});
