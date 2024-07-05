import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import SessionDeleteConfirmModal from 'pix-certif/components/sessions/session-delete-confirm-modal';
import setupIntlRenderingTest from 'pix-certif/tests/helpers/setup-intl-rendering';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | Sessions | session-delete-confirm-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('when shouldDisplaySessionDeletionModal is true', function () {
    test('it should render the modal', async function (assert) {
      // given
      const shouldDisplaySessionDeletionModal = true;
      const closeSessionDeletionConfirmModalStub = sinon.stub();
      const currentSessionToBeDeletedId = 123;

      // when
      const screen = await render(
        <template>
          <SessionDeleteConfirmModal
            @showModal={{shouldDisplaySessionDeletionModal}}
            @close={{closeSessionDeletionConfirmModalStub}}
            @sessionId={{currentSessionToBeDeletedId}}
          />
        </template>,
      );

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
      const shouldDisplaySessionDeletionModal = false;
      const closeSessionDeletionConfirmModalStub = sinon.stub();
      const currentSessionToBeDeletedId = 123;

      // when
      const screen = await render(
        <template>
          <SessionDeleteConfirmModal
            @showModal={{shouldDisplaySessionDeletionModal}}
            @close={{closeSessionDeletionConfirmModalStub}}
            @sessionId={{currentSessionToBeDeletedId}}
          />
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('heading', { name: 'Supprimer la session' })).doesNotExist();
    });
  });

  module('when clicking on close button', function () {
    test('it should call closeSessionDeletionConfirmModal method', async function (assert) {
      // given
      const shouldDisplaySessionDeletionModal = true;
      const closeSessionDeletionConfirmModalStub = sinon.stub();
      const currentSessionToBeDeletedId = 123;

      const screen = await render(
        <template>
          <SessionDeleteConfirmModal
            @showModal={{shouldDisplaySessionDeletionModal}}
            @close={{closeSessionDeletionConfirmModalStub}}
            @sessionId={{currentSessionToBeDeletedId}}
          />
        </template>,
      );

      // when
      await click(screen.getByRole('button', { name: 'Fermer' }));

      // then
      sinon.assert.calledOnce(closeSessionDeletionConfirmModalStub);
      assert.ok(true);
    });
  });

  module('when clicking on footer close button', function () {
    test('it should call closeSessionDeletionConfirmModal method', async function (assert) {
      // given
      const shouldDisplaySessionDeletionModal = true;
      const closeSessionDeletionConfirmModalStub = sinon.stub();
      const currentSessionToBeDeletedId = 123;

      const screen = await render(
        <template>
          <SessionDeleteConfirmModal
            @showModal={{shouldDisplaySessionDeletionModal}}
            @close={{closeSessionDeletionConfirmModalStub}}
            @sessionId={{currentSessionToBeDeletedId}}
          />
        </template>,
      );

      // when
      await click(screen.getByRole('button', { name: 'Annuler la suppression de la session' }));

      // then
      sinon.assert.calledOnce(closeSessionDeletionConfirmModalStub);
      assert.ok(true);
    });
  });

  module('when clicking on suppression button', function () {
    test('it should call deleteSession method', async function (assert) {
      // given
      const shouldDisplaySessionDeletionModal = true;
      const closeSessionDeletionConfirmModalStub = sinon.stub();
      const currentSessionToBeDeletedId = 123;
      const deleteSessionStub = sinon.stub();

      const screen = await render(
        <template>
          <SessionDeleteConfirmModal
            @showModal={{shouldDisplaySessionDeletionModal}}
            @close={{closeSessionDeletionConfirmModalStub}}
            @sessionId={{currentSessionToBeDeletedId}}
            @confirm={{deleteSessionStub}}
          />
        </template>,
      );

      // when
      await click(screen.getByRole('button', { name: 'Supprimer la session' }));

      // then
      sinon.assert.calledOnce(deleteSessionStub);
      assert.ok(true);
    });
  });
});
