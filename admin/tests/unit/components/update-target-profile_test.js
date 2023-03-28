import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | update-target-profile', function (hooks) {
  setupTest(hooks);

  module('#updateProfile', function () {
    test('it should call preventDefault', async function (assert) {
      // given
      const component = createGlimmerComponent('component:target-profiles/update-target-profile', {
        model: {
          name: 'Karam',
          category: 'OTHER',
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        },
      });
      const event = {
        preventDefault: sinon.stub(),
      };

      component.form.name = 'Edited name';
      component.args.model = {
        name: 'Karam',
        category: 'OTHER',
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      };
      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.updateProfile(event);

      // then
      assert.ok(event.preventDefault.called);
    });

    test('it should update the name of the target profile', async function (assert) {
      // given
      const component = createGlimmerComponent('component:target-profiles/update-target-profile', {
        model: {
          name: 'Karam',
          category: 'OTHER',
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        },
      });
      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.name = 'Edited name';
      component.args.model = {
        name: 'Karam',
        category: 'OTHER',
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      };
      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.updateProfile(event);

      // then
      assert.ok(event.preventDefault.called);
      assert.strictEqual(component.args.model.name, 'Edited name');
    });

    test('it should update the description of the target profile', async function (assert) {
      // given
      const component = createGlimmerComponent('component:target-profiles/update-target-profile', {
        model: {
          name: 'Karam',
          category: 'OTHER',
          description: null,
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        },
      });
      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.description = 'Edited description';
      component.args.model = {
        name: 'Karam',
        category: 'OTHER',
        description: null,
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      };
      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.updateProfile(event);

      // then
      assert.strictEqual(component.args.model.description, 'Edited description');
    });

    test('it should update the comment of the target profile', async function (assert) {
      // given
      const component = createGlimmerComponent('component:target-profiles/update-target-profile', {
        model: {
          name: 'Karam',
          category: 'OTHER',
          comment: null,
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        },
      });
      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.comment = 'Edited comment';
      component.args.model = {
        name: 'Karam',
        category: 'OTHER',
        comment: null,
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      };
      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.updateProfile(event);
      // then
      assert.strictEqual(component.args.model.comment, 'Edited comment');
    });

    test('it should do nothing when form is not valid', async function (assert) {
      // given
      const component = createGlimmerComponent('component:target-profiles/update-target-profile', {
        model: {
          name: 'Karam',
          category: 'OTHER',
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        },
      });

      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.name = '';

      // when
      await component.updateProfile(event);

      // then
      assert.notOk(component.args.model.save.called);
    });

    test('it should display a success notification when model has been saved', async function (assert) {
      // given
      const component = createGlimmerComponent('component:target-profiles/update-target-profile', {
        model: {
          name: 'Karam',
          category: 'OTHER',
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        },
      });

      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.name = 'Valid Name';
      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.updateProfile(event);

      // then
      assert.ok(component.notifications.success.called);
    });
  });
});
