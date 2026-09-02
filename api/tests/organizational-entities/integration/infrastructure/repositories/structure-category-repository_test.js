import { expect } from 'chai';

import {
  findAll,
  findById,
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
});
