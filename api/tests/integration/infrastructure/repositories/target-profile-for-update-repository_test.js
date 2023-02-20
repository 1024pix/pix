import { expect, databaseBuilder, catchErr, knex } from '../../../test-helper';
import TargetProfileForUpdate from '../../../../lib/domain/models/TargetProfileForUpdate';
import { categories } from '../../../../lib/domain/models/TargetProfile';
import targetProfileForUpdateRepository from '../../../../lib/infrastructure/repositories/target-profile-for-update-repository';
import { NotFoundError } from '../../../../lib/domain/errors';

describe('Integration | Repository | Target-profile-for-update', function () {
  describe('#get', function () {
    let targetProfileForUpdate;

    beforeEach(async function () {
      targetProfileForUpdate = new TargetProfileForUpdate({
        id: 4,
        name: 'name',
        description: 'description',
        comment: 'comment',
        category: categories.OTHER,
      });
      databaseBuilder.factory.buildTargetProfile(targetProfileForUpdate);
      await databaseBuilder.commit();
    });

    it('should return the target profile', async function () {
      // when
      const result = await targetProfileForUpdateRepository.get(targetProfileForUpdate.id);

      expect(result).to.deep.eq(targetProfileForUpdate);
    });

    context('when the targetProfile does not exist', function () {
      it('throws an error', async function () {
        const error = await catchErr(targetProfileForUpdateRepository.get)(1);

        expect(error).to.be.an.instanceOf(NotFoundError);
        expect(error.message).to.have.string("Le profil cible avec l'id 1 n'existe pas");
      });
    });
  });

  describe('#update', function () {
    it('should update the target profile name', async function () {
      // given
      const targetProfileForUpdate = new TargetProfileForUpdate({
        id: 4,
        name: 'name',
        description: 'description',
        comment: 'comment',
        categories: categories.OTHER,
      });
      databaseBuilder.factory.buildTargetProfile(targetProfileForUpdate);
      await databaseBuilder.commit();

      // when
      targetProfileForUpdate.name = 'Karam';
      await targetProfileForUpdateRepository.update(targetProfileForUpdate);

      // then
      const { name } = await knex('target-profiles').select('name').where('id', targetProfileForUpdate.id).first();
      expect(name).to.equal(targetProfileForUpdate.name);
    });

    it('should update the target profile description', async function () {
      // given
      const targetProfileForUpdate = new TargetProfileForUpdate({
        id: 4,
        name: 'name',
        description: 'description',
        comment: 'comment',
        categories: categories.OTHER,
      });
      databaseBuilder.factory.buildTargetProfile(targetProfileForUpdate);
      await databaseBuilder.commit();

      // when
      targetProfileForUpdate.description = 'Je change la description';
      await targetProfileForUpdateRepository.update(targetProfileForUpdate);

      // then
      const { description } = await knex('target-profiles')
        .select('description')
        .where('id', targetProfileForUpdate.id)
        .first();
      expect(description).to.equal(targetProfileForUpdate.description);
    });

    it('should update the target profile comment', async function () {
      // given
      const targetProfileForUpdate = new TargetProfileForUpdate({
        id: 4,
        name: 'name',
        description: 'description',
        comment: 'comment',
        categories: categories.OTHER,
      });
      databaseBuilder.factory.buildTargetProfile(targetProfileForUpdate);
      await databaseBuilder.commit();

      // when
      targetProfileForUpdate.comment = 'Je change le commentaire';
      await targetProfileForUpdateRepository.update(targetProfileForUpdate);

      // then
      const { comment } = await knex('target-profiles')
        .select('comment')
        .where('id', targetProfileForUpdate.id)
        .first();
      expect(comment).to.equal(targetProfileForUpdate.comment);
    });

    it('should update the target profile category', async function () {
      // given
      const targetProfileForUpdate = new TargetProfileForUpdate({
        id: 4,
        name: 'name',
        description: 'description',
        comment: 'comment',
        categories: categories.OTHER,
      });
      databaseBuilder.factory.buildTargetProfile(targetProfileForUpdate);
      await databaseBuilder.commit();

      // when
      targetProfileForUpdate.category = categories.PREDEFINED;
      await targetProfileForUpdateRepository.update(targetProfileForUpdate);

      // then
      const { category } = await knex('target-profiles')
        .select('category')
        .where('id', targetProfileForUpdate.id)
        .first();
      expect(category).to.equal(targetProfileForUpdate.category);
    });
  });
});
