import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module.only('Integration | Serializer | Grain', function (hooks) {
  setupTest(hooks);

  module('#extractRelationship', function () {
    test('should return only instantiable element', function (assert) {
      const serializer = this.owner.lookup('serializer:grain');

      const relationshipHash = {
        data: [
          { type: 'videos', id: '1' },
          { type: 'qcus', id: '3' },
          { type: 'foos', id: '3' },
        ],
      };

      const result = serializer.extractRelationship(relationshipHash);

      assert.deepEqual(result, {
        data: [
          { type: 'video', id: '1' },
          { type: 'qcu', id: '3' },
        ],
      });
    });
  });

  module.only('#deserialize', function () {
    test('should deserialize grain with inexistant element type', function (assert) {
      const serializer = this.owner.lookup('serializer:grain');
      const store = this.owner.lookup('store');
      const payload = {
        data: {
          type: 'grains',
          id: '1',
          attributes: {
            name: 'grain1',
          },
          relationships: {
            elements: [
              { type: 'videos', id: '1' },
              { type: 'foos', id: '3' },
            ],
          },
        },
        included: [
          {
            type: 'foos',
            id: '3',
            attributes: {
              name: 'foo3',
            },
          },
          {
            type: 'videos',
            id: '1',
            attributes: {
              name: 'video1',
            },
          },
        ],
      };

      const result = serializer.normalize(payload);

      assert.deepEqual(result, {
        id: '1',
        name: 'grain1',
      });
    });
  });
});
