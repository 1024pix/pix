import { expect } from 'chai';

import {
  findAll,
  findById,
  findExistingIds,
} from '../../../../../src/organizational-entities/infrastructure/repositories/structure-category-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Repository | structure-category-repository', function () {
  describe('#findAll', function () {
    it('should return all structure categories ordered by id', async function () {
      // given
      databaseBuilder.factory.buildStructureCategory({ id: 2, label: 'Collège' });
      databaseBuilder.factory.buildStructureCategory({ id: 1, label: 'Lycée' });
      await databaseBuilder.commit();

      // when
      const result = await findAll();

      // then
      expect(result).to.deep.equal([
        domainBuilder.buildStructureCategory({ id: 1, label: 'Lycée' }),
        domainBuilder.buildStructureCategory({ id: 2, label: 'Collège' }),
      ]);
    });

    it('should return an empty array if there is no structure category', async function () {
      // when
      const result = await findAll();

      // then
      expect(result).to.deep.equal([]);
    });
  });

  describe('#findById', function () {
    it('should return the structure category matching the given id', async function () {
      // given
      const structureCategory = databaseBuilder.factory.buildStructureCategory({ id: 7, label: 'Lycée' });
      databaseBuilder.factory.buildStructureCategory({ id: 1, label: 'Pro' });
      await databaseBuilder.commit();

      // when
      const result = await findById(structureCategory.id);

      // then
      expect(result).to.deep.equal(domainBuilder.buildStructureCategory(structureCategory));
    });

    it('should return null if there is no structure category matching the given id', async function () {
      // when
      const result = await findById(123);

      // then
      expect(result).to.be.null;
    });
  });

  describe('#findExistingIds', function () {
    it('should return the ids of the structure categories matching the given ids', async function () {
      // given
      const firstStructureCategory = databaseBuilder.factory.buildStructureCategory({
        label: 'Category 1',
        id: 123,
      });
      const secondStructureCategory = databaseBuilder.factory.buildStructureCategory({
        label: 'Category 2',
        id: 456,
      });
      await databaseBuilder.commit();

      // when
      const result = await findExistingIds([firstStructureCategory.id, secondStructureCategory.id]);

      // then
      expect(result).to.deep.equal([firstStructureCategory.id, secondStructureCategory.id]);
    });

    it('should return an empty array if no structure categories matches the given ids', async function () {
      // given
      const unknownIds = [123, 456];

      // when
      const result = await findExistingIds(unknownIds);

      // then
      expect(result).to.deep.equal([]);
    });
  });
});
