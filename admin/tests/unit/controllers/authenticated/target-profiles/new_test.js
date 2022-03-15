import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/target-profiles/new', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/target-profiles/new');
  });

  module('#goBackToTargetProfileList', function () {
    test('should delete record and go back target profile list page', async function (assert) {
      controller.store.deleteRecord = sinon.stub();
      controller.transitionToRoute = sinon.stub();
      controller.model = Symbol('targetProfile');

      controller.goBackToTargetProfileList();

      assert.ok(controller.store.deleteRecord.calledWith(controller.model));
      assert.ok(controller.transitionToRoute.calledWith('authenticated.target-profiles.list'));
    });
  });

  module('#saveFileObject', function (hooks) {
    const filename = 'myfile';
    const files = [{ name: filename }];

    hooks.beforeEach(function () {
      sinon.restore();
      sinon.stub(FileReader.prototype, 'readAsText');
    });

    test('should read the file', async function (assert) {
      controller.saveFileObject(files);

      assert.ok(FileReader.prototype.readAsText.calledWith(files[0]));
    });

    test('should set filename', async function (assert) {
      controller.saveFileObject(files);

      assert.strictEqual(controller.filename, filename);
    });
  });

  module('#_onFileLoad', function (hooks) {
    hooks.afterEach(function () {
      sinon.restore();
    });

    module('when json file is valid', function (hooks) {
      hooks.beforeEach(function () {
        sinon.restore();

        // given
        controller.model = {};
        controller.isFileInvalid = true;
        const event = {
          target: {
            result: [{ skills: ['skill1'] }, { skills: ['skill2'] }],
          },
        };
        const skillsList = [{ skills: ['skill1'] }, { skills: ['skill2'] }];

        // when
        sinon.stub(JSON, 'parse').returns(skillsList);
        controller._onFileLoad(event);
      });

      test('it should set isFileInvalid to false', function (assert) {
        assert.notOk(controller.isFileInvalid);
      });

      test('it should fill skillIds list', function (assert) {
        assert.deepEqual(controller.model.skillIds, ['skill1', 'skill2']);
      });
    });

    module('when json file is invalid', function () {
      test('it should set isFileInvalid to true', function (assert) {
        controller.isFileInvalid = false;
        const event = {
          target: {
            result: [],
          },
        };

        // when
        sinon.stub(JSON, 'parse').throws();
        controller._onFileLoad(event);

        assert.ok(controller.isFileInvalid);
      });
    });

    module('when skillIds list is empty', function () {
      test('it should set isFileInvalid to true', function (assert) {
        // given
        controller.isFileInvalid = false;
        const event = {
          target: {
            result: [],
          },
        };

        // when
        sinon.stub(JSON, 'parse').returns([]);
        controller._onFileLoad(event);

        assert.ok(controller.isFileInvalid);
      });
    });
  });

  module('#createTargetProfile', function () {
    test('it should save model', async function (assert) {
      controller.model = {
        id: 3,
        save: sinon.stub(),
      };

      controller.transitionToRoute = sinon.stub();

      controller.notifications = {
        success: sinon.stub(),
      };

      const event = {
        preventDefault: sinon.stub(),
      };

      controller.model.save.resolves();

      // when
      await controller.createTargetProfile(event);

      // then
      assert.ok(event.preventDefault.called);
      assert.ok(controller.model.save.called);
      assert.ok(controller.notifications.success.calledWith('Le profil cible a été créé avec succès.'));
      assert.ok(
        controller.transitionToRoute.calledWith('authenticated.target-profiles.target-profile', controller.model.id)
      );
    });

    test('it should display notification Error when model cannot be saved', async function (assert) {
      controller.model = {
        save: sinon.stub(),
      };

      controller.notifications = {
        error: sinon.stub(),
      };

      const event = {
        preventDefault: sinon.stub(),
      };

      controller.model.save.rejects();

      // when
      await controller.createTargetProfile(event);

      // then
      assert.ok(event.preventDefault.called);
      assert.ok(controller.model.save.called);
      assert.ok(controller.notifications.error.calledWith('Une erreur est survenue.'));
    });
  });
});
