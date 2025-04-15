import _ from 'lodash';

import { CERTIFICATION_FEATURES } from '../../../../../src/certification/shared/domain/constants.js';
import { CertificationCenter } from '../../../../../src/organizational-entities/domain/models/CertificationCenter.js';
import * as certificationCenterRepository from '../../../../../src/organizational-entities/infrastructure/repositories/certification-center.repository.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Integration | Organizational Entities | Infrastructure | Repository | Certification Center', function () {
  let clock, now;

  beforeEach(function () {
    now = new Date('2021-11-16');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#getById', function () {
    context('when the certification center could not be found', function () {
      it('throws a NotFound error', async function () {
        // when
        const unknownCenterId = 1;
        const error = await catchErr(certificationCenterRepository.getById)({ id: unknownCenterId });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Center not found');
      });
    });

    context('when the certification center has no habilitations', function () {
      it('returns the certification center without habilitations', async function () {
        // given
        const centerId = 1;
        databaseBuilder.factory.buildCertificationCenter({
          id: centerId,
          type: CertificationCenter.types.PRO,
          archivedAt: null,
          archivedBy: null,
          createdAt: now,
          updatedAt: now,
        });
        await databaseBuilder.commit();

        // when
        const result = await certificationCenterRepository.getById({
          id: centerId,
        });

        // then
        const expectedCenter = new CertificationCenter({
          id: centerId,
          name: 'some name',
          type: 'PRO',
          externalId: 'EX123',
          habilitations: [],
          features: [],
          archivedAt: null,
          archivedBy: null,
          updatedAt: now,
          createdAt: now,
        });
        expect(result).to.deepEqualInstance(expectedCenter);
      });
    });

    context('when the certification center is a feature pilot', function () {
      it('returns the information', async function () {
        // given
        const centerId = 1;
        databaseBuilder.factory.buildCertificationCenter({
          id: centerId,
          type: CertificationCenter.types.PRO,
          archivedAt: null,
          archivedBy: null,
          updatedAt: now,
          createdAt: now,
        });
        const feature = databaseBuilder.factory.buildFeature({
          key: CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key,
        });
        databaseBuilder.factory.buildCertificationCenterFeature({
          certificationCenterId: centerId,
          featureId: feature.id,
        });
        await databaseBuilder.commit();

        // when
        const result = await certificationCenterRepository.getById({
          id: centerId,
        });

        // then
        const expectedCenter = new CertificationCenter({
          id: centerId,
          name: 'some name',
          type: 'PRO',
          externalId: 'EX123',
          habilitations: [],
          features: [CERTIFICATION_FEATURES.CAN_REGISTER_FOR_A_COMPLEMENTARY_CERTIFICATION_ALONE.key],
          archivedAt: null,
          archivedBy: null,
          updatedAt: now,
          createdAt: now,
        });
        expect(result).to.deepEqualInstance(expectedCenter);
      });
    });

    it('returns the certification center by its id', async function () {
      // given
      const centerId = 1;
      databaseBuilder.factory.buildCertificationCenter({
        id: centerId,
        type: CertificationCenter.types.SCO,
        archivedAt: null,
        archivedBy: null,
        updatedAt: now,
        createdAt: now,
      });
      const clea = databaseBuilder.factory.buildComplementaryCertification.clea({});
      const droit = databaseBuilder.factory.buildComplementaryCertification.droit({});
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: centerId,
        complementaryCertificationId: clea.id,
      });
      databaseBuilder.factory.buildComplementaryCertificationHabilitation({
        certificationCenterId: centerId,
        complementaryCertificationId: droit.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await certificationCenterRepository.getById({
        id: centerId,
      });

      // then
      const expectedCenter = new CertificationCenter({
        id: centerId,
        name: 'some name',
        type: 'SCO',
        externalId: 'EX123',
        updatedAt: now,
        createdAt: now,
        archivedAt: null,
        archivedBy: null,
        habilitations: [
          domainBuilder.certification.enrolment.buildHabilitation({
            complementaryCertificationId: clea.id,
            key: clea.key,
            label: clea.label,
          }),
          domainBuilder.certification.enrolment.buildHabilitation({
            complementaryCertificationId: droit.id,
            key: droit.key,
            label: droit.label,
          }),
        ],
        features: [],
      });
      expect(result).to.deepEqualInstance(expectedCenter);
    });
  });

  describe('#findPaginatedFiltered', function () {
    context('when there are CertificationCenters in the database', function () {
      it('returns an Array of CertificationCenters', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'First certification center',
          externalId: '1',
          type: 'SUP',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
          archivedAt: null,
          archivedBy: null,
        });
        const expectedCertificationCenter1 = new CertificationCenter({
          id: 1,
          name: 'First certification center',
          type: CertificationCenter.types.SUP,
          externalId: '1',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [],
          updatedAt: now,
          archivedAt: null,
          archivedBy: null,
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 2,
          name: 'Second certification center',
          externalId: '2',
          type: 'SCO',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
          archivedAt: null,
          archivedBy: null,
        });
        const expectedCertificationCenter2 = new CertificationCenter({
          id: 2,
          name: 'Second certification center',
          type: CertificationCenter.types.SCO,
          externalId: '2',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [],
          updatedAt: now,
          archivedAt: null,
          archivedBy: null,
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 3,
          name: 'Third certification center',
          externalId: '3',
          type: 'PRO',
          createdAt: new Date('2018-04-01T05:43:10Z'),
          updatedAt: now,
          archivedAt: null,
          archivedBy: null,
        });
        const expectedCertificationCenter3 = new CertificationCenter({
          id: 3,
          name: 'Third certification center',
          type: CertificationCenter.types.PRO,
          externalId: '3',
          createdAt: new Date('2018-04-01T05:43:10Z'),
          habilitations: [],
          updatedAt: now,
          archivedAt: null,
          archivedBy: null,
        });
        await databaseBuilder.commit();

        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingCertificationCenters).to.have.lengthOf(3);
        expect(matchingCertificationCenters).to.deep.include.members([
          expectedCertificationCenter1,
          expectedCertificationCenter2,
          expectedCertificationCenter3,
        ]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are lots of CertificationCenters (> 10) in the database', function () {
      it('returns paginated matching CertificationCenters', async function () {
        // given
        _.times(12, databaseBuilder.factory.buildCertificationCenter);
        await databaseBuilder.commit();

        const filter = {};
        const page = { number: 1, size: 3 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 4, rowCount: 12 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingCertificationCenters).to.have.lengthOf(3);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple CertificationCenters matching the same "name" search pattern', function () {
      it('returns only CertificationCenters matching "name" if given in filters', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ name: 'Dragon & co center' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'Dragonades & co center' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'Broca & co center' });
        databaseBuilder.factory.buildCertificationCenter({ name: 'Donnie & co center' });
        await databaseBuilder.commit();

        const filter = { name: 'dra' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingCertificationCenters).to.have.lengthOf(2);
        expect(_.map(matchingCertificationCenters, 'name')).to.have.members([
          'Dragon & co center',
          'Dragonades & co center',
        ]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple CertificationCenters matching the same "type" search pattern', function () {
      it('returns only CertificationCenters matching "type" if given in filters', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ type: 'PRO' });
        databaseBuilder.factory.buildCertificationCenter({ type: 'PRO' });
        databaseBuilder.factory.buildCertificationCenter({ type: 'SUP' });
        databaseBuilder.factory.buildCertificationCenter({ type: 'SCO' });
        await databaseBuilder.commit();

        const filter = { type: 'S' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingCertificationCenters, 'type')).to.have.members(['SUP', 'SCO']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are multiple CertificationCenters matching the same "externalId" search pattern', function () {
      it('returns only CertificationCenters matching "externalId" if given in filters', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ externalId: 'AZH578' });
        databaseBuilder.factory.buildCertificationCenter({ externalId: 'BFR842' });
        databaseBuilder.factory.buildCertificationCenter({ externalId: 'AZH002' });
        await databaseBuilder.commit();

        const filter = { externalId: 'AZ' };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingCertificationCenters, 'externalId')).to.have.members(['AZH578', 'AZH002']);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context(
      'when there are multiple CertificationCenters matching the fields "first name", "last name" and "email" search pattern',
      function () {
        it('returns only CertificationCenters matching "name" AND "type" AND "externalId" if given in filters', async function () {
          // given
          _buildThreeCertificationCenterMatchingNameTypeAndExternalId({ databaseBuilder, numberOfBuild: 3 });
          _buildThreeCertificationCenterUnmatchingNameTypeOrExternalId({ databaseBuilder, numberOfBuild: 3 });
          await databaseBuilder.commit();

          const filter = { name: 'name_ok', type: 'SCO', externalId: 'c_ok' };
          const page = { number: 1, size: 10 };
          const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

          // when
          const { models: matchingCertificationCenters, pagination } =
            await certificationCenterRepository.findPaginatedFiltered({ filter, page });

          // then
          expect(_.map(matchingCertificationCenters, 'name')).to.have.members(['name_ok_1', 'name_ok_2', 'name_ok_3']);
          expect(_.map(matchingCertificationCenters, 'type')).to.have.members(['SCO', 'SCO', 'SCO']);
          expect(_.map(matchingCertificationCenters, 'externalId')).to.have.members(['c_ok_1', 'c_ok_2', 'c_ok_3']);
          expect(pagination).to.deep.equal(expectedPagination);
        });
      },
    );

    context('when there are filters that should be ignored', function () {
      it('ignores the filters and retrieve all certificationCenters', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({ id: 1 });
        databaseBuilder.factory.buildCertificationCenter({ id: 2 });
        await databaseBuilder.commit();

        const filter = { foo: 1 };
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 2 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(_.map(matchingCertificationCenters, 'id')).to.have.members([1, 2]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });
  });
});

function _buildThreeCertificationCenterMatchingNameTypeAndExternalId({ databaseBuilder }) {
  databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_1', type: 'SCO', externalId: 'c_ok_1' });
  databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_2', type: 'SCO', externalId: 'c_ok_2' });
  databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_3', type: 'SCO', externalId: 'c_ok_3' });
}

function _buildThreeCertificationCenterUnmatchingNameTypeOrExternalId({ databaseBuilder }) {
  databaseBuilder.factory.buildCertificationCenter({ name: 'name_ko_4', type: 'SCO', externalId: 'c_ok_4' });
  databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_5', type: 'SUP', externalId: 'c_ok_5' });
  databaseBuilder.factory.buildCertificationCenter({ name: 'name_ok_6', type: 'SCO', externalId: 'c_ko_1' });
}
