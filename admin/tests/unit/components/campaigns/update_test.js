import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Campaigns | update', function (hooks) {
  setupTest(hooks);

  module('#update', function () {
    test('it should update controller campaign fields', async function (assert) {
      // given
      const component = createGlimmerComponent('component:campaigns/update', {
        campaign: {
          name: '',
          title: '',
          customeLandingPageText: '',
          customeResultPageText: '',
          customeResultPageButtonText: '',
          customeResultPageButtonUrl: '',
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        },
      });

      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.name = 'some name';
      component.form.title = 'some title';
      component.form.customLandingPageText = 'some text';
      component.form.customResultPageText = 'some text again';
      component.form.customResultPageButtonText = 'some button text';
      component.form.customResultPageButtonUrl = 'google.com';

      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.update(event);

      // then
      assert.ok(event.preventDefault.called);
      assert.ok(component.args.campaign.save.called);
      assert.strictEqual(component.form.name, 'some name');
      assert.strictEqual(component.form.title, 'some title');
      assert.strictEqual(component.form.customLandingPageText, 'some text');
      assert.strictEqual(component.form.customResultPageText, 'some text again');
      assert.strictEqual(component.form.customResultPageButtonText, 'some button text');
      assert.strictEqual(component.form.customResultPageButtonUrl, 'google.com');
    });

    test('it should display a success notification when campaign has been saved', async function (assert) {
      // given
      const component = createGlimmerComponent('component:campaigns/update', {
        campaign: {
          name: 'some name',
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        },
      });

      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.name = 'other name';

      component.notifications = { success: sinon.stub(), error: sinon.stub() };

      // when
      await component.update(event);

      // then
      assert.ok(component.notifications.success.called);
    });
  });
});
