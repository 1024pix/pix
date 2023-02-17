import { module, test } from 'qunit';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | session-delete-confirm-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when shouldDisplaySessionDeletionModal is true', function () {
    test('it should render the modal', async function (assert) {
      // given
      this.shouldDisplaySessionDeletionModal = true;
      this.closeSessionDeletionConfirmModalStub = sinon.stub();
      this.currentSessionToBeDeletedId = 123;

      // when
      const screen = await renderScreen(hbs`<SessionDeleteConfirmModal
      @showModal={{this.shouldDisplaySessionDeletionModal}}
      @close={{this.closeSessionDeletionConfirmModalStub}}
      @sessionId={{this.currentSessionToBeDeletedId}}
    />`);

      // then
      assert.dom(screen.getByRole('heading', { name: 'Supprimer la session' })).exists();
      assert
        .dom(screen.getByText('Souhaitez-vous supprimer la session', { exact: false }))
        .hasText('Souhaitez-vous supprimer la session 123 ?');
    });
  });

  module('when shouldDisplaySessionDeletionModal is false', function () {
    test('it should not render the modal', async function (assert) {
      // given
      this.shouldDisplaySessionDeletionModal = false;
      this.closeSessionDeletionConfirmModalStub = sinon.stub();
      this.currentSessionToBeDeletedId = 123;

      // when
      const screen = await renderScreen(hbs`<SessionDeleteConfirmModal
      @showModal={{this.shouldDisplaySessionDeletionModal}}
      @close={{this.closeSessionDeletionConfirmModalStub}}
      @sessionId={{this.currentSessionToBeDeletedId}}
    />`);

      // then
      assert.dom(screen.queryByRole('heading', { name: 'Supprimer la session' })).doesNotExist();
    });
  });

  module('when clicking on close button', function () {
    test('it should call closeSessionDeletionConfirmModal method', async function (assert) {
      // given
      this.shouldDisplaySessionDeletionModal = true;
      this.closeSessionDeletionConfirmModalStub = sinon.stub();
      this.currentSessionToBeDeletedId = 123;

      const screen = await renderScreen(hbs`<SessionDeleteConfirmModal
        @showModal={{this.shouldDisplaySessionDeletionModal}}
        @close={{this.closeSessionDeletionConfirmModalStub}}
        @sessionId={{this.currentSessionToBeDeletedId}}
      />`);

      // when
      await click(screen.getByRole('button', { name: 'Fermer' }));

      // then
      sinon.assert.calledOnce(this.closeSessionDeletionConfirmModalStub);
      assert.ok(true);
    });
  });

  module('when clicking on footer close button', function () {
    test('it should call closeSessionDeletionConfirmModal method', async function (assert) {
      // given
      this.shouldDisplaySessionDeletionModal = true;
      this.closeSessionDeletionConfirmModalStub = sinon.stub();
      this.currentSessionToBeDeletedId = 123;

      const screen = await renderScreen(hbs`<SessionDeleteConfirmModal
        @showModal={{this.shouldDisplaySessionDeletionModal}}
        @close={{this.closeSessionDeletionConfirmModalStub}}
        @sessionId={{this.currentSessionToBeDeletedId}}
      />`);

      // when
      await click(screen.getByRole('button', { name: 'Annuler la suppression de la session' }));

      // then
      sinon.assert.calledOnce(this.closeSessionDeletionConfirmModalStub);
      assert.ok(true);
    });
  });

  module('when clicking on suppression button', function () {
    test('it should call deleteSession method', async function (assert) {
      // given
      this.shouldDisplaySessionDeletionModal = true;
      this.closeSessionDeletionConfirmModalStub = sinon.stub();
      this.currentSessionToBeDeletedId = 123;
      this.deleteSessionStub = sinon.stub();

      const screen = await renderScreen(hbs`<SessionDeleteConfirmModal
        @showModal={{this.shouldDisplaySessionDeletionModal}}
        @close={{this.closeSessionDeletionConfirmModalStub}}
        @sessionId={{this.currentSessionToBeDeletedId}}
        @confirm={{this.deleteSessionStub}}
      />`);

      // when
      await click(screen.getByRole('button', { name: 'Supprimer la session' }));

      // then
      sinon.assert.calledOnce(this.deleteSessionStub);
      assert.ok(true);
    });
  });
});
