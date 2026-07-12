import sinon from 'sinon';

import { ArchiveCertificationCentersInBatchError } from '../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { CertificationCenterInvitation } from '../../../../../src/team/domain/models/CertificationCenterInvitation.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Organizational Entities | Domain | UseCase | archive-certification-centers-in-batch', function () {
  it('archives the certification centers and related data', async function () {
    // given
    const creationDate = new Date(2021, 1, 1);
    const lastUpdateBeforeArchive = new Date(2022, 2, 2);
    const now = new Date(2023, 3, 3);
    const clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    const pendingStatus = CertificationCenterInvitation.StatusType.PENDING;
    const superAdminUser = databaseBuilder.factory.buildUser();
    const user = databaseBuilder.factory.buildUser({});

    const certificationCenter1 = databaseBuilder.factory.buildCertificationCenter({
      updatedAt: lastUpdateBeforeArchive,
      createdAt: creationDate,
    });

    databaseBuilder.factory.buildCertificationCenterMembership({
      certificationCenterId: certificationCenter1.id,
      userId: user.id,
      createdAt: creationDate,
      updatedAt: lastUpdateBeforeArchive,
    });

    databaseBuilder.factory.buildCertificationCenterInvitation({
      certificationCenterId: certificationCenter1.id,
      email: user.email,
      status: pendingStatus,
    });

    const certificationCenter2 = databaseBuilder.factory.buildCertificationCenter({
      updatedAt: lastUpdateBeforeArchive,
      createdAt: creationDate,
    });

    databaseBuilder.factory.buildCertificationCenterMembership({
      certificationCenterId: certificationCenter2.id,
      userId: user.id,
      createdAt: creationDate,
      updatedAt: lastUpdateBeforeArchive,
    });

    databaseBuilder.factory.buildCertificationCenterInvitation({
      certificationCenterId: certificationCenter2.id,
      email: user.email,
      status: pendingStatus,
    });

    await databaseBuilder.commit();

    // when
    await usecases.archiveCertificationCentersInBatch({
      certificationCenterIds: [certificationCenter1.id, certificationCenter2.id],
      userId: superAdminUser.id,
    });

    // then
    const archivedCertificationCenter1 = await knex('certification-centers')
      .where({ id: certificationCenter1.id })
      .first();
    const disabledCertificationCenter1Membership = await knex('certification-center-memberships')
      .where({ certificationCenterId: certificationCenter1.id })
      .first();
    const deletedCertificationCenter1Invitation = await knex('certification-center-invitations').where({
      certificationCenterId: certificationCenter1.id,
    });

    const archivedCertificationCenter2 = await knex('certification-centers')
      .where({ id: certificationCenter2.id })
      .first();
    const disabledCertificationCenter2Membership = await knex('certification-center-memberships')
      .where({ certificationCenterId: certificationCenter2.id })
      .first();
    const deletedCertificationCenter2Invitation = await knex('certification-center-invitations').where({
      certificationCenterId: certificationCenter2.id,
    });

    expect(archivedCertificationCenter1.archivedAt).to.deep.equal(now);
    expect(archivedCertificationCenter1.archivedBy).to.deep.equal(superAdminUser.id);
    expect(archivedCertificationCenter1.updatedAt).to.deep.equal(lastUpdateBeforeArchive);

    expect(disabledCertificationCenter1Membership.disabledAt).to.deep.equal(now);
    expect(disabledCertificationCenter1Membership.updatedByUserId).to.deep.equal(superAdminUser.id);
    expect(disabledCertificationCenter1Membership.updatedAt).to.deep.equal(lastUpdateBeforeArchive);

    expect(deletedCertificationCenter1Invitation).to.be.empty;

    expect(archivedCertificationCenter2.archivedAt).to.deep.equal(now);
    expect(archivedCertificationCenter2.archivedBy).to.deep.equal(superAdminUser.id);
    expect(archivedCertificationCenter2.updatedAt).to.deep.equal(lastUpdateBeforeArchive);

    expect(disabledCertificationCenter2Membership.disabledAt).to.deep.equal(now);
    expect(disabledCertificationCenter2Membership.updatedByUserId).to.deep.equal(superAdminUser.id);
    expect(disabledCertificationCenter2Membership.updatedAt).to.deep.equal(lastUpdateBeforeArchive);

    expect(deletedCertificationCenter2Invitation).to.be.empty;

    clock.restore();
  });

  context('when certification center does not exist', function () {
    it('throws an error archive certification centers in batch error', async function () {
      // given
      const creationDate = new Date(2021, 1, 1);
      const lastUpdateBeforeArchive = new Date(2022, 2, 2);
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
      const error = await catchErr(usecases.archiveCertificationCentersInBatch)({
        certificationCenterIds: [certificationCenter.id, 1234],
        userId: superAdminUser.id,
      });

      // then
      expect(error).to.be.instanceOf(ArchiveCertificationCentersInBatchError);
      expect(error.meta).to.deep.equal({
        currentLine: 2,
        totalLines: 2,
      });
    });
  });
});
