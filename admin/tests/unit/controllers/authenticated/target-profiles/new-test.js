import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | authenticated/target-profiles/new', function(hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated/target-profiles/new');
  });

  module('#goBackToTargetProfileList', function() {
    test('should delete record and go back target profile list page', async function(assert) {
      controller.store.deleteRecord = sinon.stub();
      controller.transitionToRoute = sinon.stub();
      controller.model = Symbol('targetProfile');

      controller.goBackToTargetProfileList();

      assert.ok(controller.store.deleteRecord.calledWith(controller.model));
      assert.ok(controller.transitionToRoute.calledWith('authenticated.target-profiles.list'));
    });
  });

  module('#saveFileObject', function(hooks) {
    hooks.beforeEach(function() {
      sinon.restore();
    });

    test('should read the file', async function(assert) {
      const event = {
        target: {
          files: [Symbol('myFile')],
        },
      };

      sinon.stub(FileReader.prototype, 'readAsText');

      controller.saveFileObject(event);

      assert.ok(FileReader.prototype.readAsText.calledWith(event.target.files[0]));
    });

    test('should parse the file', async function(assert) {
      controller.model = {};
      const event = {
        target: {
          files: [Symbol('myFile')],
          result: [JSON.stringify([{ skills: ['skill1'] }, { skills: ['skill2'] }])],
        },
      };

      let onLoadFunction;
      sinon.stub(FileReader.prototype, 'readAsText');
      sinon.stub(FileReader.prototype, 'onload').set(function(onload) {
        onLoadFunction = onload;
      });

      controller.saveFileObject(event);

      onLoadFunction(event);

      assert.deepEqual(controller.model.skillsId, ['skill1', 'skill2']);
      assert.equal(controller.isFileInvalid, false);
    });
    test('should cannot parse the file', async function(assert) {
      controller.model = {};
      const event = {
        target: {
          files: [Symbol('myFile')],
          result: [JSON.stringify('toto')],
        },
      };

      let onLoadFunction;
      sinon.stub(FileReader.prototype, 'readAsText');
      sinon.stub(FileReader.prototype, 'onload').set(function(onload) {
        onLoadFunction = onload;
      });

      controller.saveFileObject(event);

      onLoadFunction(event);

      assert.equal(controller.isFileInvalid, true);
    });

  });

  module('#createTargetProfile', function() {
    test('it should save model', async function(assert) {
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
      assert.ok(controller.transitionToRoute.calledWith('authenticated.target-profiles.target-profile', controller.model.id));
    });

    test('it should display notification Error when model cannot be saved', async function(assert) {
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
