import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CandidateDeletionModal from 'pix-certif/components/sessions/session-details/enrolled-candidates/candidate-deletion-modal';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

const TRANSLATE_PREFIX = 'pages.sessions.detail.candidates.deletion-modal';

function renderComponent({ candidate, toggleModal }) {
  return render(
    <template>
      <CandidateDeletionModal @showModal={{true}} @toggleModal={{toggleModal}} @candidate={{candidate}} />
    </template>,
  );
}

module(
  'Integration | Component | Sessions | SessionDetails | EnrolledCandidates | candidate-deletion-modal',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    const candidateData = {
      firstName: 'Jean',
      lastName: 'De la fontaine',
      birthdate: '2000-01-01',
    };
    const formattedBirthdate = '01/01/2000';

    let screen, candidate, toggleModalStub;

    hooks.beforeEach(async function () {
      // given
      const store = this.owner.lookup('service:store');
      candidate = store.createRecord('certification-candidate', candidateData);

      toggleModalStub = sinon.stub();

      // when
      screen = await renderComponent({ candidate, toggleModal: toggleModalStub });
    });

    test('it shows form', async function (assert) {
      // then
      assert.dom(screen.getByRole('heading', { name: t(`${TRANSLATE_PREFIX}.title`) })).exists();

      const expectedBody = t(`${TRANSLATE_PREFIX}.body`, {
        ...candidateData,
        birthdate: formattedBirthdate,
        htmlSafe: true,
      });
      assert.dom(screen.getByText((content, node) => node.innerHTML.trim() === `${expectedBody}`)).exists();
    });

    module('when submit button is clicked', function (hooks) {
      hooks.beforeEach(function () {
        // given
        const routerService = this.owner.lookup('service:router');
        sinon.stub(routerService, 'currentRoute').value({ parent: { params: { session_id: '123' } } });

        const pixToastService = this.owner.lookup('service:pix-toast');
        sinon.stub(pixToastService, 'sendSuccessNotification');

        candidate.destroyRecord = sinon.stub().resolves();
      });

      module('when everything is fine', function () {
        test('it deletes candidate and close modal', async function (assert) {
          // when
          await click(
            screen.getByRole('button', {
              name: t(`${TRANSLATE_PREFIX}.actions.submit`),
            }),
          );

          // then
          assert.true(candidate.destroyRecord.calledOnceWithExactly({ adapterOptions: { sessionId: 123 } }));
          assert.true(toggleModalStub.calledOnce);
        });
      });

      module('when there is an error', function (hooks) {
        let sendErrorNotificationStub;

        hooks.beforeEach(function () {
          // given
          const pixToastService = this.owner.lookup('service:pix-toast');
          sendErrorNotificationStub = sinon.stub(pixToastService, 'sendErrorNotification');

          candidate.destroyRecord = sinon.stub().rejects();
        });

        test('it displays a toast and close modal', async function (assert) {
          // when
          await click(
            screen.getByRole('button', {
              name: t(`${TRANSLATE_PREFIX}.actions.submit`),
            }),
          );

          // then
          assert.true(
            sendErrorNotificationStub.calledOnceWithExactly({
              message: t(`${TRANSLATE_PREFIX}.notifications.error-remove-unknown`),
            }),
          );
          assert.true(toggleModalStub.calledOnce);
        });

        module('when candidate has already joined the session', function (hooks) {
          hooks.beforeEach(function () {
            // given
            candidate.destroyRecord = sinon.stub().rejects({ errors: [{ code: 403 }] });
          });

          test('it displays a dedicated toast and close modal', async function (assert) {
            // when
            await click(
              screen.getByRole('button', {
                name: t(`${TRANSLATE_PREFIX}.actions.submit`),
              }),
            );

            // then
            assert.true(
              sendErrorNotificationStub.calledOnceWithExactly({
                message: t(`${TRANSLATE_PREFIX}.notifications.error-remove-already-in`),
              }),
            );
            assert.true(toggleModalStub.calledOnce);
          });
        });
      });
    });

    module('when top close button is clicked', () => {
      test('it closes candidate details modal', async function (assert) {
        // when
        await click(screen.getByRole('button', { name: t('common.actions.close') }));

        // then
        assert.true(toggleModalStub.calledOnce);
      });
    });

    module('when footer action button is clicked', () => {
      test('it closes candidate details modal', async function (assert) {
        // when
        await click(
          screen.getByRole('button', {
            name: t(`${TRANSLATE_PREFIX}.actions.close-extra-information`),
          }),
        );

        // then
        assert.true(toggleModalStub.calledOnce);
      });
    });
  },
);
