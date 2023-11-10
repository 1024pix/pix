import { expect, databaseBuilder, knex, catchErr } from '../../../test-helper.js';
import {
  setCategoriesToTargetProfiles,
  setCategoryToTargetProfiles,
} from '../../../../scripts/prod/select-category-for-target-profiles.js';
import { categories } from '../../../../lib/domain/models/TargetProfile.js';

describe('Integration | Scripts | select-category-for-target-profiles.js', function () {
  let firstTargetProfileId;
  let secondTargetProfileId;
  let otherTargetProfileId;

  beforeEach(async function () {
    firstTargetProfileId = databaseBuilder.factory.buildTargetProfile({ category: null }).id;
    secondTargetProfileId = databaseBuilder.factory.buildTargetProfile({ category: null }).id;
    otherTargetProfileId = databaseBuilder.factory.buildTargetProfile({ category: null }).id;
    await databaseBuilder.commit();
  });

  describe('#setCategoryToTargetProfiles', function () {
    it('should set category on target profiles', async function () {
      const targetProfilesId = [firstTargetProfileId, secondTargetProfileId];

      await setCategoryToTargetProfiles(categories.COMPETENCES, targetProfilesId);

      const targetProfilesCategories = await knex('target-profiles')
        .select('category')
        .whereIn('id', targetProfilesId)
        .distinct('category');
      expect(targetProfilesCategories).to.deep.equal([{ category: categories.COMPETENCES }]);
    });

    it('should not set category on other target profiles', async function () {
      const targetProfilesId = [firstTargetProfileId, secondTargetProfileId];

      await setCategoryToTargetProfiles(categories.COMPETENCES, targetProfilesId);

      const { category } = await knex('target-profiles').where({ id: otherTargetProfileId }).first();
      expect(category).equal(null);
    });

    it('should skip non existing ids', async function () {
      const targetProfilesId = [456];

      await expect(setCategoryToTargetProfiles(categories.COMPETENCES, targetProfilesId)).to.be.fulfilled;
    });
  });

  describe('#setCategoriesToTargetProfiles', function () {
    it('should return categories that are not supported', async function () {
      const { invalidCategories } = await setCategoriesToTargetProfiles(`targetProfileId,category
1,WRONG
2,BAD`);

      expect(invalidCategories).deep.equal(['WRONG', 'BAD']);
    });

    it('should return target profiles that are not valid', async function () {
      const { invalidTargetProfiles } = await setCategoriesToTargetProfiles(`targetProfileId,category
,COMPETENCES
yolo,COMPETENCES`);

      expect(invalidTargetProfiles).deep.equal(['', 'yolo']);
    });

    it('should not set categories that are not supported', async function () {
      await setCategoriesToTargetProfiles(`targetProfileId,category
${firstTargetProfileId},WRONG`);

      const { category } = await knex('target-profiles').where({ id: firstTargetProfileId }).first();
      expect(category).equal(null);
    });

    it('should throw an error if the category column is missing', async function () {
      const error = await catchErr(setCategoriesToTargetProfiles)(`targetProfileId,missing
1,COMPETENCES`);

      expect(error.message).equal('Les colonnes "category" et "targetProfileId" sont obligatoires');
    });

    it('should throw an error if the target profile id column is missing', async function () {
      const error = await catchErr(setCategoriesToTargetProfiles)(`missing,category
1,COMPETENCES`);

      expect(error.message).equal('Les colonnes "category" et "targetProfileId" sont obligatoires');
    });

    it('should update target profiles with different categories', async function () {
      const csvData = `targetProfileId,category
${firstTargetProfileId},DISCIPLINE
${secondTargetProfileId},COMPETENCES`;

      await setCategoriesToTargetProfiles(csvData);

      const targetProfiles = await knex('target-profiles').select(['id', 'category']).whereNotNull('category');
      expect(targetProfiles).to.deep.have.members([
        { id: firstTargetProfileId, category: categories.DISCIPLINE },
        { id: secondTargetProfileId, category: categories.COMPETENCES },
      ]);
    });

    it('should return total updated rows', async function () {
      const csvData = `targetProfileId,category
${firstTargetProfileId},DISCIPLINE
${secondTargetProfileId},DISCIPLINE`;

      const { totalUpdatedRows } = await setCategoriesToTargetProfiles(csvData);

      expect(totalUpdatedRows).equal(2);
    });
  });
});
