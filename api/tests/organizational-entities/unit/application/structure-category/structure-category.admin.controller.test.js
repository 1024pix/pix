import { expect } from 'chai';
import sinon from 'sinon';

import { structureCategoriesController } from '../../../../../src/organizational-entities/application/structure-category/structure-category.admin.controller.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Organizational Entities | Application | Controller | Admin | StructureCategory', function () {
  describe('#findAllCategories', function () {
    it('calls findAllStructureCategories usecase and StructureCategory serializer', async function () {
      // given
      const structureCategory1 = domainBuilder.buildStructureCategory({ label: 'Collège' });
      const structureCategory2 = domainBuilder.buildStructureCategory({ label: 'Lycée' });
      const structureCategories = [structureCategory1, structureCategory2];
      sinon.stub(usecases, 'findAllStructureCategories').resolves(structureCategories);
      const structureCategorySerializer = { serialize: sinon.stub() };

      // when
      await structureCategoriesController.findAllCategories({}, hFake, {
        structureCategorySerializer,
      });

      // then
      expect(usecases.findAllStructureCategories).to.have.been.calledOnce;
      expect(structureCategorySerializer.serialize).to.have.been.calledWithExactly(structureCategories);
    });
  });
});
