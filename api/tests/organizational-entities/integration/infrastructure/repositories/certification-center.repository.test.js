import _ from 'lodash';

import * as certificationCenterRepository from '../../../../../src/organizational-entities/infrastructure/repositories/certification-center.repository.js';
import { CertificationCenter } from '../../../../../src/shared/domain/models/CertificationCenter.js';
import { databaseBuilder, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Integration | Organizational Entities | Infrastructure | Repository | Certification Center', function () {
  let clock, now;

  beforeEach(function () {
    now = new Date('2021-11-16');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  describe('#findPaginatedFiltered', function () {
    context('when there are CertificationCenters in the database', function () {
      it('should return an Array of CertificationCenters', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'First certification center',
          externalId: '1',
          type: 'SUP',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        });
        const expectedCertificationCenter1 = domainBuilder.buildCertificationCenter({
          id: 1,
          name: 'First certification center',
          type: CertificationCenter.types.SUP,
          externalId: '1',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [],
          updatedAt: now,
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 2,
          name: 'Second certification center',
          externalId: '2',
          type: 'SCO',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        });
        const expectedCertificationCenter2 = domainBuilder.buildCertificationCenter({
          id: 2,
          name: 'Second certification center',
          type: CertificationCenter.types.SCO,
          externalId: '2',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [],
          updatedAt: now,
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 3,
          name: 'Third certification center',
          externalId: '3',
          type: 'PRO',
          createdAt: new Date('2018-04-01T05:43:10Z'),
          updatedAt: now,
        });
        const expectedCertificationCenter3 = domainBuilder.buildCertificationCenter({
          id: 3,
          name: 'Third certification center',
          type: CertificationCenter.types.PRO,
          externalId: '3',
          createdAt: new Date('2018-04-01T05:43:10Z'),
          habilitations: [],
          updatedAt: now,
        });
        await databaseBuilder.commit();

        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingCertificationCenters.length).to.equal(3);
        expect(matchingCertificationCenters).to.deep.include.members([
          expectedCertificationCenter1,
          expectedCertificationCenter2,
          expectedCertificationCenter3,
        ]);
        expect(pagination).to.deep.equal(expectedPagination);
      });

      it('should return an Array of CertificationCenters and their habilitations', async function () {
        // given
        databaseBuilder.factory.buildCertificationCenter({
          id: 3,
          name: 'Third certification center',
          externalId: '3',
          type: 'PRO',
          createdAt: new Date('2018-04-01T05:43:10Z'),
          updatedAt: now,
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 33,
          label: 'Complementary certification name',
          key: 'COMP1',
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: 3,
          complementaryCertificationId: 33,
        });
        const expectedComplementaryCertification3 = domainBuilder.buildComplementaryCertification({
          id: 33,
          label: 'Complementary certification name',
          key: 'COMP1',
        });
        const expectedCertificationCenter3 = domainBuilder.buildCertificationCenter({
          id: 3,
          name: 'Third certification center',
          type: CertificationCenter.types.PRO,
          externalId: '3',
          createdAt: new Date('2018-04-01T05:43:10Z'),
          habilitations: [expectedComplementaryCertification3],
          updatedAt: now,
        });

        databaseBuilder.factory.buildCertificationCenter({
          id: 1,
          name: 'First certification center',
          externalId: '1',
          type: 'SUP',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 11,
          label: 'Complementary certification name',
          key: 'COMP2',
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: 1,
          complementaryCertificationId: 11,
        });
        const expectedComplementaryCertification1 = domainBuilder.buildComplementaryCertification({
          id: 11,
          label: 'Complementary certification name',
          key: 'COMP2',
        });
        const expectedCertificationCenter1 = domainBuilder.buildCertificationCenter({
          id: 1,
          name: 'First certification center',
          type: CertificationCenter.types.SUP,
          externalId: '1',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [expectedComplementaryCertification1],
          updatedAt: now,
        });
        databaseBuilder.factory.buildCertificationCenter({
          id: 2,
          name: 'Second certification center',
          externalId: '2',
          type: 'SCO',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          updatedAt: now,
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 22,
          label: 'Complementary certification name',
          key: 'COMP3',
        });
        databaseBuilder.factory.buildComplementaryCertificationHabilitation({
          certificationCenterId: 2,
          complementaryCertificationId: 22,
        });
        const expectedComplementaryCertification2 = domainBuilder.buildComplementaryCertification({
          id: 22,
          label: 'Complementary certification name',
          key: 'COMP3',
        });
        const expectedCertificationCenter2 = domainBuilder.buildCertificationCenter({
          id: 2,
          name: 'Second certification center',
          type: CertificationCenter.types.SCO,
          externalId: '2',
          createdAt: new Date('2018-01-01T05:43:10Z'),
          habilitations: [expectedComplementaryCertification2],
          updatedAt: now,
        });

        await databaseBuilder.commit();

        const filter = {};
        const page = { number: 1, size: 10 };
        const expectedPagination = { page: page.number, pageSize: page.size, pageCount: 1, rowCount: 3 };

        // when
        const { models: matchingCertificationCenters, pagination } =
          await certificationCenterRepository.findPaginatedFiltered({ filter, page });

        // then
        expect(matchingCertificationCenters).to.deepEqualArray([
          expectedCertificationCenter1,
          expectedCertificationCenter2,
          expectedCertificationCenter3,
        ]);
        expect(pagination).to.deep.equal(expectedPagination);
      });
    });

    context('when there are lots of CertificationCenters (> 10) in the database', function () {
      it('should return paginated matching CertificationCenters', async function () {
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
      it('should return only CertificationCenters matching "name" if given in filters', async function () {
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
      it('should return only CertificationCenters matching "type" if given in filters', async function () {
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
      it('should return only CertificationCenters matching "externalId" if given in filters', async function () {
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
        it('should return only CertificationCenters matching "name" AND "type" AND "externalId" if given in filters', async function () {
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
      it('should ignore the filters and retrieve all certificationCenters', async function () {
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
