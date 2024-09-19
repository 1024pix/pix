import * as complementaryCertificationBadgeRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/complementary-certification-badge-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Integration | Repository | ComplementaryCertificationBadge', function () {
  describe('#findAll', function () {
    it('should return all complementarycertificationbadge models from DB', async function () {
      // given
      const complementaryCertificationId1 = databaseBuilder.factory.buildComplementaryCertification({ key: 'key1' }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 1,
        minimumEarnedPix: 150,
        complementaryCertificationId: complementaryCertificationId1,
        detachedAt: '2020-01-01',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 4,
        minimumEarnedPix: 150,
        complementaryCertificationId: complementaryCertificationId1,
      });
      const complementaryCertificationId2 = databaseBuilder.factory.buildComplementaryCertification({ key: 'key2' }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 3,
        minimumEarnedPix: 350,
        complementaryCertificationId: complementaryCertificationId2,
      });
      const complementaryCertificationId3 = databaseBuilder.factory.buildComplementaryCertification({ key: 'key3' }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 2,
        minimumEarnedPix: 0,
        complementaryCertificationId: complementaryCertificationId3,
      });
      await databaseBuilder.commit();

      // when
      const actualComplementaryCertificationBadges = await complementaryCertificationBadgeRepository.findAll();

      // then
      const expectedResult = [
        domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
          id: 1,
          requiredPixScore: 150,
          offsetVersion: 1,
          currentAttachedComplementaryCertificationBadgeId: 4,
        }),
        domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
          id: 2,
          requiredPixScore: 0,
          offsetVersion: 0,
          currentAttachedComplementaryCertificationBadgeId: 2,
        }),
        domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
          id: 3,
          requiredPixScore: 350,
          offsetVersion: 0,
          currentAttachedComplementaryCertificationBadgeId: 3,
        }),
        domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
          id: 4,
          requiredPixScore: 150,
          offsetVersion: 0,
          currentAttachedComplementaryCertificationBadgeId: 4,
        }),
      ];
      expect(actualComplementaryCertificationBadges).to.have.deep.members(expectedResult);
    });

    it('should return empty array when there are none', async function () {
      // when
      const actualComplementaryCertificationBadges = await complementaryCertificationBadgeRepository.findAll();

      // then
      expect(actualComplementaryCertificationBadges).to.deepEqualArray([]);
    });
  });
});
