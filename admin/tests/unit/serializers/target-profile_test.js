import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Serializer | Target Profile', function (hooks) {
  setupTest(hooks);

  module('initial behaviour', function () {
    module('with tubes', function () {
      test('it serializes records', function (assert) {
        const store = this.owner.lookup('service:store');

        const targetProfileData = {
          areKnowledgeElementsResettable: true,
          category: 'cat',
          comment: 'comment',
          description: 'desc',
          imageUrl: 'some-url',
          isPublic: true,
          name: 'name',
          ownerOrganizationId: 1,
        };
        const tubes = Symbol('tubes');

        const record = store.createRecord('target-profile', targetProfileData);
        const serializedRecord = record.serialize({ tubes });

        assert.deepEqual(serializedRecord.data.attributes, {
          'are-knowledge-elements-resettable': targetProfileData.areKnowledgeElementsResettable,
          category: targetProfileData.category,
          comment: targetProfileData.comment,
          description: targetProfileData.description,
          'image-url': targetProfileData.imageUrl,
          'is-public': targetProfileData.isPublic,
          name: targetProfileData.name,
          'owner-organization-id': String(targetProfileData.ownerOrganizationId),
          tubes,
        });
      });
    });

    module('without tubes', function () {
      test('it serializes records', function (assert) {
        const store = this.owner.lookup('service:store');

        const targetProfileData = {
          areKnowledgeElementsResettable: true,
          category: 'cat',
          comment: 'comment',
          description: 'desc',
          imageUrl: 'some-url',
          isPublic: true,
          name: 'name',
          ownerOrganizationId: 1,
        };

        const record = store.createRecord('target-profile', targetProfileData);
        const serializedRecord = record.serialize();

        assert.deepEqual(serializedRecord.data.attributes, {
          'are-knowledge-elements-resettable': targetProfileData.areKnowledgeElementsResettable,
          category: targetProfileData.category,
          comment: targetProfileData.comment,
          description: targetProfileData.description,
          'image-url': targetProfileData.imageUrl,
          'is-public': targetProfileData.isPublic,
          name: targetProfileData.name,
          'owner-organization-id': String(targetProfileData.ownerOrganizationId),
        });
      });
    });
  });

  module('update mode behaviour', function () {
    module('with tubes', function () {
      test('it serializes records', function (assert) {
        // given
        const store = this.owner.lookup('service:store');

        const targetProfileData = {
          areKnowledgeElementsResettable: true,
          category: 'cat',
          comment: 'comment',
          description: 'desc',
          imageUrl: 'some-url',
          name: 'name',
        };
        const tubes = Symbol('tubes');

        const record = store.createRecord('target-profile', targetProfileData);

        // when
        const serializedRecord = record.serialize({ update: true, tubes });

        // then
        assert.deepEqual(serializedRecord.data.attributes, {
          'are-knowledge-elements-resettable': targetProfileData.areKnowledgeElementsResettable,
          category: targetProfileData.category,
          comment: targetProfileData.comment,
          description: targetProfileData.description,
          'image-url': targetProfileData.imageUrl,
          name: targetProfileData.name,
          tubes,
        });
      });
    });

    module('without tubes', function () {
      test('it serializes records', function (assert) {
        const store = this.owner.lookup('service:store');

        const targetProfileData = {
          areKnowledgeElementsResettable: true,
          category: 'cat',
          comment: 'comment',
          description: 'desc',
          imageUrl: 'some-url',
          name: 'name',
        };

        const record = store.createRecord('target-profile', targetProfileData);
        const serializedRecord = record.serialize({ update: true });

        assert.deepEqual(serializedRecord.data.attributes, {
          'are-knowledge-elements-resettable': targetProfileData.areKnowledgeElementsResettable,
          category: targetProfileData.category,
          comment: targetProfileData.comment,
          description: targetProfileData.description,
          'image-url': targetProfileData.imageUrl,
          name: targetProfileData.name,
        });
      });
    });
  });
});
