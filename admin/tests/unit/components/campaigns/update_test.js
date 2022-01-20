import { module, test } from 'qunit';
import sinon from 'sinon';
import { setupTest } from 'ember-qunit';
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.form.name, 'some name');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.form.title, 'some title');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.form.customLandingPageText, 'some text');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.form.customResultPageText, 'some text again');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.form.customResultPageButtonText, 'some button text');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.form.customResultPageButtonUrl, 'google.com');
    });

    test('it should update campaign title even if it is empty', async function (assert) {
      // given
      const component = createGlimmerComponent('component:campaigns/update', {
        campaign: {
          name: 'some name',
          title: '',
          save: sinon.stub(),
          rollbackAttributes: sinon.stub(),
        },
      });

      const event = {
        preventDefault: sinon.stub(),
      };
      component.form.title = '';

      // when
      await component.update(event);

      // then
      assert.ok(component.args.campaign.save.called);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(component.args.campaign.title, null);
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
