import _ from 'lodash';

import { CenterForAdmin } from '../../../../../src/organizational-entities/domain/models/CenterForAdmin.js';
import * as certificationCenterForAdminRepository from '../../../../../src/organizational-entities/infrastructure/repositories/certification-center-for-admin.repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { databaseBuilder, expect, knex, sinon } from '../../../../test-helper.js';

describe('Integration | Organizational Entities | Infrastructure | Repository | certification-center-for-admin', function () {
  let clock;
  const now = new Date('2021-11-16');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#save', function () {
    it('saves the given certification center', async function () {
      // given
      const certificationCenterId = 1;
      const certificationCenterName = 'CertificationCenterName';
      const certificationCenterType = 'SCO';

      const center = databaseBuilder.factory.buildCertificationCenter({
        id: certificationCenterId,
        name: certificationCenterName,
        type: certificationCenterType,
      });

      const certificationCenterForAdmin = new CenterForAdmin({
        center,
      });

      // when
      const savedCertificationCenter = await certificationCenterForAdminRepository.save(certificationCenterForAdmin);

      // then
      expect(savedCertificationCenter).to.be.instanceof(CenterForAdmin);
      expect(savedCertificationCenter.id).to.exist;
      expect(savedCertificationCenter.name).to.equal(certificationCenterName);
      expect(savedCertificationCenter.type).to.equal(certificationCenterType);
    });
  });

  describe('#update', function () {
    let center;

    before(async function () {
      // given
      center = databaseBuilder.factory.buildCertificationCenter();
      await databaseBuilder.commit();
    });

    it('updates the given certification center', async function () {
      // when
      await certificationCenterForAdminRepository.update({
        id: center.id,
        name: 'Great Oak Certification Center',
        updatedAt: now,
      });

      // then
      const updatedCertificationCenter = await knex('certification-centers').select().where({ id: center.id }).first();
      expect(_.omit(updatedCertificationCenter, 'isV3Pilot')).to.deep.equal({
        ...center,
        name: 'Great Oak Certification Center',
        updatedAt: updatedCertificationCenter.updatedAt,
      });
    });
  });

  describe('#archive', function () {
    it('archives the given certification center', async function () {
      // given
      const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
      const archiveDate = new Date(2021, 10, 31);

      const certificationCenter = databaseBuilder.factory.buildCertificationCenter({
        updatedAt: new Date(2021, 12, 3),
      });
      const otherCertificationCenter = databaseBuilder.factory.buildCertificationCenter({
        updatedAt: new Date(2021, 12, 3),
      });

      await databaseBuilder.commit();

      // when
      await certificationCenterForAdminRepository.archive({
        certificationCenterId: certificationCenter.id,
        archivedBy: superAdminUserId,
        archiveDate,
      });

      // then
      const archivedCertificationCenter = await knex('certification-centers')
        .where({ id: certificationCenter.id })
        .first();

      expect(archivedCertificationCenter.archivedBy).to.equal(superAdminUserId);
      expect(archivedCertificationCenter.archivedAt).to.deep.equal(archiveDate);

      const nonArchivedCertificationCenter = await knex('certification-centers')
        .where({ id: otherCertificationCenter.id })
        .first();
      expect(_.omit(nonArchivedCertificationCenter, 'isV3Pilot')).to.deep.equal(
        _.omit(otherCertificationCenter, 'isV3Pilot'),
      );
    });

    describe('when certification center does not exist', function () {
      it('throws NotFoundError', async function () {
        // given
        const certificationCenterId = 1;
        const archiveDate = new Date(2021, 10, 31);

        const superAdminUserId = databaseBuilder.factory.buildUser.withRole().id;
        await databaseBuilder.commit();

        // when
        await expect(
          certificationCenterForAdminRepository.archive({
            certificationCenterId,
            archivedBy: superAdminUserId,
            archiveDate,
          }),
        ).to.be.rejectedWith(NotFoundError);
      });
    });
  });
});
