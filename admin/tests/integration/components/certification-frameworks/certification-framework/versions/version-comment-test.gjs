import { render } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import VersionComment from 'pix-admin/components/certification-frameworks/certification-framework/modal/version-comment';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest, { t } from '../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Component | Complementary certifications/certification-framework/modal | Version comment',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    let pixToast;

    hooks.beforeEach(function () {
      pixToast = this.owner.lookup('service:pix-toast');
    });

    test('it renders a textarea with maxlength', async function (assert) {
      // given
      const version = { comments: '' };

      // when
      const screen = await render(<template><VersionComment @version={{version}} /></template>);

      // then
      assert.dom(screen.getByRole('textbox')).exists();
      assert.dom(screen.getByRole('textbox')).hasAttribute('maxlength', '500');
    });

    test('it initializes textarea with existing version comment', async function (assert) {
      // given
      const version = { comments: 'Un commentaire existant' };

      // when
      const screen = await render(<template><VersionComment @version={{version}} /></template>);

      // then
      assert.dom(screen.getByRole('textbox')).hasValue('Un commentaire existant');
    });

    test('it renders the save button', async function (assert) {
      // given
      const version = { comments: '' };

      // when
      const screen = await render(<template><VersionComment @version={{version}} /></template>);

      // then
      assert.dom(screen.getByRole('button', { name: t('common.actions.save') })).exists();
    });

    module('when saving comments succeeds', function () {
      test('it updates the version comments and shows a success toast', async function (assert) {
        // given
        const version = { comments: '', save: sinon.stub().resolves() };
        const onSave = sinon.stub();
        sinon.stub(pixToast, 'sendSuccessNotification');

        const screen = await render(<template><VersionComment @version={{version}} @onSave={{onSave}} /></template>);
        await fillIn(screen.getByRole('textbox'), 'Mon nouveau commentaire');

        // when
        await click(screen.getByRole('button', { name: t('common.actions.save') }));

        // then
        assert.strictEqual(version.comments, 'Mon nouveau commentaire');
        assert.ok(pixToast.sendSuccessNotification.calledOnce);
      });
    });

    module('when saving comments fails', function () {
      test('it shows an error toast, rolls back attributes and does not call onSave', async function (assert) {
        // given
        const version = {
          comments: '',
          save: sinon.stub().rejects(new Error('Network error')),
          rollbackAttributes: sinon.stub(),
        };
        const onSave = sinon.stub();
        sinon.stub(pixToast, 'sendErrorNotification');

        const screen = await render(<template><VersionComment @version={{version}} @onSave={{onSave}} /></template>);

        // when
        await click(screen.getByRole('button', { name: t('common.actions.save') }));

        // then
        assert.ok(version.rollbackAttributes.calledOnce);
        assert.ok(pixToast.sendErrorNotification.calledOnce);
        assert.ok(onSave.notCalled);
      });
    });
  },
);
