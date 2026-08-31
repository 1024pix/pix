import { expect } from 'chai';

import { structureCategorySerializer } from '../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/structure-category/structure-category-serializer.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | structure-category-serializer', function () {
  describe('#serialize', function () {
    it('should return a JSON API serialized structure category', function () {
      // given
      const structureCategory = domainBuilder.buildStructureCategory({ id: 123, label: 'Collège' });

      // when
      const serializedStructureCategory = structureCategorySerializer.serialize(structureCategory);

      // then
      expect(serializedStructureCategory).to.deep.equal({
        data: {
          id: '123',
          type: 'structure-categories',
          attributes: {
            label: 'Collège',
          },
        },
      });
    });
  });
});
