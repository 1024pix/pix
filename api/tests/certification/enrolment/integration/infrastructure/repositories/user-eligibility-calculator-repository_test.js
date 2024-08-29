import * as userEligibilityCalculatorRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/user-eligibility-calculator-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Integration | Repository | UserEligibilityCalculator', function () {
  describe('#findHowManyVersionsBehindByComplementaryCertificationBadgeId', function () {
    it('should return a key value result with complementaryCertificationBadgeId as key and versionsBehind as value', async function () {
      // given
      const complementaryCertificationId1 = databaseBuilder.factory.buildComplementaryCertification({
        key: 'someKey1',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 1,
        level: 1,
        detachedAt: null,
        complementaryCertificationId: complementaryCertificationId1,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 2,
        level: 1,
        detachedAt: new Date('2021-01-01'),
        complementaryCertificationId: complementaryCertificationId1,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 3,
        level: 1,
        detachedAt: new Date('2022-02-02'),
        complementaryCertificationId: complementaryCertificationId1,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 4,
        level: 2,
        detachedAt: new Date('2021-01-01'),
        complementaryCertificationId: complementaryCertificationId1,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 5,
        level: 2,
        detachedAt: new Date('2022-02-02'),
        complementaryCertificationId: complementaryCertificationId1,
      });
      const complementaryCertificationId2 = databaseBuilder.factory.buildComplementaryCertification({
        key: 'someKey2',
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 6,
        level: 1,
        detachedAt: new Date('2023-03-03'),
        complementaryCertificationId: complementaryCertificationId2,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 7,
        level: 1,
        detachedAt: null,
        complementaryCertificationId: complementaryCertificationId2,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 8,
        level: 1,
        detachedAt: new Date('2024-04-04'),
        complementaryCertificationId: complementaryCertificationId2,
      });
      await databaseBuilder.commit();

      // when
      const howManyVersionsBehindByComplementaryCertificationBadgeId =
        await userEligibilityCalculatorRepository.findHowManyVersionsBehindByComplementaryCertificationBadgeId();

      // then
      expect(howManyVersionsBehindByComplementaryCertificationBadgeId).to.deep.equal({
        1: 0,
        2: 2,
        3: 1,
        4: 2,
        5: 1,
        6: 2,
        7: 0,
        8: 1,
      });
    });
  });
});
