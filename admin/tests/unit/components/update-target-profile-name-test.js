import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | update-target-profile-name', (hooks) => {
  setupTest(hooks);

  module('#updateProfileName', () => {
    test('it should update controller name field', async function(assert) {
      // given
      const component = createGlimmerComponent('component:target-profiles/update-target-profile-name', { model: {
        name: 'Karam',
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      } });
      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.name = 'Edited name';
      component.args.model = {
        name: 'Karam',
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      };
      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.updateProfileName(event);

      // then
      assert.ok(event.preventDefault.called);
    });

    test('it should do nothing when form is not valid', async function(assert) {
      // given
      const component = createGlimmerComponent('component:target-profiles/update-target-profile-name', { model: {
        name: 'Karam',
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      } });

      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.name = '';

      // when
      await component.updateProfileName(event);

      // then
      assert.notOk(component.args.model.save.called);
    });

    test('it should display a success notification when model has been saved', async function(assert) {
      // given
      const component = createGlimmerComponent('component:target-profiles/update-target-profile-name', { model: {
        name: 'Karam',
        save: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      } });

      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.name = 'Valid Name';
      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.updateProfileName(event);

      // then
      assert.ok(component.notifications.success.called);
    });

  });
});
