import { CombinedCourseBlueprintForUpdate } from '../../../../../src/quest/domain/models/CombinedCourseBlueprintForUpdate.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Combined course | Domain | UseCases | update-combined-course-blueprint', function () {
  context('when combined course blueprint exists', function () {
    it('should update a combined course blueprint when attributes are changed', async function () {
      // given
      const combinedCourseBlueprint = await databaseBuilder.factory.buildCombinedCourseBlueprint({
        name: 'Old épure',
        internalName: 'Une vieille épure pour tel niveau',
        illustration: 'illustrations/ma-vieille-epure.png',
        description: 'Vieille description',
        surveyUrl: 'http://www.old-survey',
      });
      await databaseBuilder.commit();

      const combinedCourseBlueprintForUpdate = new CombinedCourseBlueprintForUpdate({
        name: 'Ma nouvelle épure',
        internalName: 'Une nouvelle épure pour tel niveau',
        illustration: 'illustrations/ma-nouvelle-epure.png',
        description: 'Nouvelle description',
        surveyLink: 'http://new-survey',
      });

      //when
      await usecases.updateCombinedCourseBlueprint({
        combinedCourseBlueprintId: combinedCourseBlueprint.id,
        combinedCourseBlueprintForUpdate,
      });

      //then
      const combinedCourseBlueprints = await knex('combined_course_blueprints');
      expect(combinedCourseBlueprints).lengthOf(1);
      expect(combinedCourseBlueprints[0].name).to.equal(combinedCourseBlueprintForUpdate.name);
      expect(combinedCourseBlueprints[0].internalName).to.equal(combinedCourseBlueprintForUpdate.internalName);
      expect(combinedCourseBlueprints[0].illustration).to.equal(combinedCourseBlueprintForUpdate.illustration);
      expect(combinedCourseBlueprints[0].description).to.equal(combinedCourseBlueprintForUpdate.description);
      expect(combinedCourseBlueprints[0].surveyUrl).to.equal(combinedCourseBlueprintForUpdate.surveyLink);

      expect(combinedCourseBlueprints[0].updatedAt).to.be.instanceOf(Date);
    });
  });
  context('when combined course blueprint does not exist', function () {
    it('should return a NotFoundError', async function () {
      const combinedCourseBlueprintForUpdate = new CombinedCourseBlueprintForUpdate({
        name: 'Mon épure',
        internalName: 'Une épure pour tel niveau',
        illustration: 'illustrations/mon-epure.png',
        description: 'Description',
        surveyLink: 'http://www.survey',
      });

      const error = await catchErr(usecases.updateCombinedCourseBlueprint)({
        combinedCourseBlueprintId: 10,
        combinedCourseBlueprintForUpdate,
      });

      expect(error).to.be.instanceOf(NotFoundError);
    });
  });
});
