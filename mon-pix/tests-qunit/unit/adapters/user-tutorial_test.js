import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapters | user-tutorial', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:user-tutorial');
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
      assert.expect(0);
      sinon.assert.calledWith(
        adapter.ajax,
        'http://localhost:3000/api/users/tutorials/tutorialId',
        'PUT',
        expectedOptions
      );
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
      const url = adapter.urlForDeleteRecord(null, 'user-tutorial', snapshot);

      // then
      assert.equal(url, 'http://localhost:3000/api/users/tutorials/tutorialId');
    });
  });
});
