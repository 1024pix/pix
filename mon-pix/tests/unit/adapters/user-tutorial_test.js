import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Adapters | user-saved-tutorial', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:user-saved-tutorial');
    adapter.ajax = sinon.stub().resolves();
  });

  module('#createRecord', function () {
    test('should call API to create a user-tutorial with skill-id from tutorial', async function (assert) {
      // given
      const tutorialId = 'tutorialId';
      const skillId = 'skillId';
      const tutorial = { id: tutorialId, attr: sinon.stub() };
      const snapshot = {
        belongsTo: sinon.stub(),
      };
      snapshot.belongsTo.withArgs('tutorial').returns(tutorial);
      tutorial.attr.withArgs('skillId').returns(skillId);

      // when
      await adapter.createRecord(null, 'user-tutorial', snapshot);

      // then
      const expectedOptions = {
        data: {
          data: {
            attributes: {
              'skill-id': skillId,
            },
          },
        },
      };
      sinon.assert.calledWith(
        adapter.ajax,
        'http://localhost:3000/api/users/tutorials/tutorialId',
        'PUT',
        expectedOptions
      );
      assert.ok(true);
    });
  });

  module('#urlForDeleteRecord', function () {
    test('should return API to delete a user-tutorial', async function (assert) {
      // given
      const tutorialId = 'tutorialId';
      const tutorial = { id: tutorialId };
      const snapshot = {
        belongsTo: sinon.stub(),
      };
      snapshot.belongsTo.withArgs('tutorial').returns(tutorial);

      // when
      const url = adapter.urlForDeleteRecord(null, 'user-saved-tutorial', snapshot);

      // then
      assert.strictEqual(url, 'http://localhost:3000/api/users/tutorials/tutorialId');
    });
  });
});
