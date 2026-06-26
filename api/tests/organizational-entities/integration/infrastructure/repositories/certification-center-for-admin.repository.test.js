import sinon from 'sinon';

import { AttachedCertificationCenter } from '../../../../../src/organizational-entities/domain/models/AttachedCertificationCenter.js';
import { CenterForAdmin } from '../../../../../src/organizational-entities/domain/models/CenterForAdmin.js';
import * as certificationCenterForAdminRepository from '../../../../../src/organizational-entities/infrastructure/repositories/certification-center-for-admin.repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';

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
      const certificationCenterName = 'CertificationCenterName';
      const certificationCenterType = 'SCO';
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const certificationCenterForAdmin = new CenterForAdmin({
        center: { name: certificationCenterName, type: certificationCenterType, createdBy: userId },
      });

      // when
      const savedCertificationCenter = await certificationCenterForAdminRepository.save(certificationCenterForAdmin);

      // then
      expect(savedCertificationCenter).to.be.instanceof(CenterForAdmin);
      expect(savedCertificationCenter.id).to.exist;
      expect(savedCertificationCenter.name).to.equal(certificationCenterName);
      expect(savedCertificationCenter.type).to.equal(certificationCenterType);
      expect(savedCertificationCenter.createdBy).to.equal(userId);
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
      expect(updatedCertificationCenter).to.deep.equal({
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
      expect(nonArchivedCertificationCenter).to.deep.equal(otherCertificationCenter);
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

  describe('#findAttachedByOrganizationId', function () {
    describe('when a given organization is linked to a certification center', function () {
      it('returns certification center linked to a given organization', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;

        const { organization } = databaseBuilder.factory.buildOrganizationWithStructure({ certificationCenterId });

        await databaseBuilder.commit();

        // when
        const foundCertificationCenter = await certificationCenterForAdminRepository.findAttachedByOrganizationId(
          organization.id,
        );

        // then
        expect(foundCertificationCenter).to.have.lengthOf(1);
        expect(foundCertificationCenter[0].id).to.equal(certificationCenterId);
        expect(foundCertificationCenter[0]).to.be.instanceOf(AttachedCertificationCenter);
      });

      it('does not return certification center linked to another organization', async function () {
        // given
        const firstCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const { organization: firstOrganization } = databaseBuilder.factory.buildOrganizationWithStructure({
          certificationCenterId: firstCertificationCenter.id,
        });

        const secondCertificationCenter = databaseBuilder.factory.buildCertificationCenter();
        databaseBuilder.factory.buildOrganizationWithStructure({
          certificationCenterId: secondCertificationCenter.id,
        });

        await databaseBuilder.commit();

        // when
        const foundCertificationCenter = await certificationCenterForAdminRepository.findAttachedByOrganizationId(
          firstOrganization.id,
        );

        // then
        expect(foundCertificationCenter[0].id).to.equal(firstCertificationCenter.id);
      });
    });

    describe('when a given organization has no linked certification center', function () {
      it('returns an empty array', async function () {
        // given
        const { organization } = databaseBuilder.factory.buildOrganizationWithStructure();
        await databaseBuilder.commit();

        // when
        const foundCertificationCenter = await certificationCenterForAdminRepository.findAttachedByOrganizationId(
          organization.id,
        );

        // then
        expect(foundCertificationCenter).to.be.an('array').that.is.empty;
      });
    });
  });

  describe('#exists', function () {
    describe('when a given certification center exists', function () {
      it('returns true', async function () {
        // given
        const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
        await databaseBuilder.commit();

        // when
        const result = await certificationCenterForAdminRepository.exists({ certificationCenterId });

        // then
        expect(result).to.be.true;
      });
    });

    describe('when a given certification center does not exist', function () {
      it('returns false', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter();
        await databaseBuilder.commit();

        // when
        const result = await certificationCenterForAdminRepository.exists({ certificationCenterId: 99 });

        // then
        expect(result).to.be.false;
      });
    });
  });
});
