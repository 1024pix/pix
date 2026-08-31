import { expect } from 'chai';

import * as combinedCourseBlueprintShareRepository from '../../../../../src/quest/infrastructure/repositories/combined-course-blueprint-share-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Quest | Integration | Repository | combined-course-blueprint-share', function () {
  describe('#findByCombinedCourseBlueprintIdAndOrganizationId', function () {
    it('should return a combined course blueprint share', async function () {
      //given
      databaseBuilder.factory.buildCombinedCourseBlueprintShare();
      const { combinedCourseBlueprintId, organizationId } = databaseBuilder.factory.buildCombinedCourseBlueprintShare();
      databaseBuilder.factory.buildCombinedCourseBlueprintShare();

      await databaseBuilder.commit();

      // when
      const result = await combinedCourseBlueprintShareRepository.findByCombinedCourseBlueprintIdAndOrganizationId({
        combinedCourseBlueprintId,
        organizationId,
      });

      //then
      expect(result.combinedCourseBlueprintId).to.equal(combinedCourseBlueprintId);
      expect(result.organizationId).to.equal(organizationId);
    });

    describe('when combined course blueprint share does not exist', function () {
      it('should return null', async function () {
        //given
        databaseBuilder.factory.buildCombinedCourseBlueprintShare();
        databaseBuilder.factory.buildCombinedCourseBlueprintShare();
        databaseBuilder.factory.buildCombinedCourseBlueprintShare();

        await databaseBuilder.commit();

        // when
        const result = await combinedCourseBlueprintShareRepository.findByCombinedCourseBlueprintIdAndOrganizationId({
          combinedCourseBlueprintId: 999,
          organizationId: 999,
        });

        //then
        expect(result).to.be.null;
      });
    });
  });
});
