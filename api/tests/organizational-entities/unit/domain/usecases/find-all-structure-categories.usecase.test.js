import sinon from 'sinon';

import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCases | find-all-structure-categories', function () {
  it('should return all structure categories', async function () {
    // given
    const secondStructureCategory = domainBuilder.buildStructureCategory({ id: 2, label: 'Collège' });
    const firstStructureCategory = domainBuilder.buildStructureCategory({ id: 1, label: 'Lycée' });
    const structureCategoryRepository = {
      findAll: sinon.stub(),
    };

    structureCategoryRepository.findAll.resolves([firstStructureCategory, secondStructureCategory]);

    // when
    const result = await usecases.findAllStructureCategories({ structureCategoryRepository });

    // then
    expect(result).to.deep.equal([
      domainBuilder.buildStructureCategory({ id: firstStructureCategory.id, label: firstStructureCategory.label }),
      domainBuilder.buildStructureCategory({
        id: secondStructureCategory.id,
        label: secondStructureCategory.label,
      }),
    ]);
  });
});
