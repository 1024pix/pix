import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
// eslint-disable-next-line no-restricted-imports
import { click, fillIn, find } from '@ember/test-helpers';
import ModuleQrocm from 'mon-pix/components/module/element/qrocm';
import ENV from 'mon-pix/config/environment';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | QROCM', function (hooks) {
  setupIntlRenderingTest(hooks);

  const originalDelay = ENV.APP.MODULIX_VERIFICATION_RESPONSE_DELAY;
  let passageEventService, passageEventRecordStub;

  hooks.beforeEach(function () {
    passageEventService = this.owner.lookup('service:passageEvents');
    passageEventRecordStub = sinon.stub(passageEventService, 'record');
  });

  hooks.afterEach(function () {
    passageEventRecordStub.restore();
    ENV.APP.MODULIX_VERIFICATION_RESPONSE_DELAY = originalDelay;
  });

  test('should display a block QROCM', async function (assert) {
    // given
    const qrocm = {
      id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
      instruction: 'Mon instruction',
      proposals: [
        { content: '<span>Ma première proposition</span>', type: 'text' },
        {
          input: 'symbole',
          inputType: 'text',
          display: 'block',
          size: 1,
          placeholder: '',
          ariaLabel: 'input-aria',
          type: 'input',
        },
        {
          input: 'premiere-partie',
          type: 'select',
          display: 'block',
          placeholder: '',
          ariaLabel: 'select-aria',
          options: [
            {
              id: '1',
              content: "l'identifiant",
            },
            {
              id: '2',
              content: "le fournisseur d'adresse mail",
            },
          ],
        },
      ],
      type: 'qrocm',
    };
    const screen = await render(<template><ModuleQrocm @element={{qrocm}} /></template>);
    const direction = t('pages.modulix.qrocm.direction', {
      count: qrocm.proposals.filter(({ type }) => type !== 'text').length,
    });

    // then
    assert.ok(screen);
    assert.ok(screen.getByRole('group', { legend: direction }));

    const form = find('form');
    assert.dom(form).exists();
    const formDescription = find(`#${form.getAttribute('aria-describedby')}`);
    assert.dom(formDescription).hasText('Mon instruction');

    assert.dom(screen.getByText('Ma première proposition')).exists({ count: 1 });
    assert.ok(screen.getByRole('textbox', { name: 'input-aria' }));
    assert.dom(screen.getByText("l'identifiant")).exists({ count: 1 });
    assert.dom(screen.getByText("le fournisseur d'adresse mail")).exists({ count: 1 });
    assert.ok(screen.getByLabelText('select-aria'));
    assert.dom('.element-qrocm-proposals__input--block').exists({ count: 2 });
  });

  test('should display an inline QROCM', async function (assert) {
    // given
    const qrocm = {
      id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
      instruction: 'Mon instruction',
      proposals: [
        { content: '<span>Ma première proposition</span>', type: 'text' },
        {
          input: 'symbole',
          inputType: 'number',
          display: 'inline',
          size: 1,
          placeholder: '',
          ariaLabel: 'input-aria',
          type: 'input',
        },
        {
          input: 'premiere-partie',
          type: 'select',
          display: 'inline',
          placeholder: '',
          ariaLabel: 'select-aria',
          options: [
            {
              id: '1',
              content: "l'identifiant",
            },
            {
              id: '2',
              content: "le fournisseur d'adresse mail",
            },
          ],
        },
      ],
      type: 'qrocm',
    };
    const screen = await render(<template><ModuleQrocm @element={{qrocm}} /></template>);

    // then
    assert.ok(screen);
    assert.dom(screen.getByText('Mon instruction')).exists({ count: 1 });
    assert.ok(
      screen.getByRole('group', {
        legend: t('pages.modulix.qrocm.direction', {
          count: qrocm.proposals.filter(({ type }) => type !== 'text').length,
        }),
      }),
    );
    assert.dom(screen.getByText('Ma première proposition')).exists({ count: 1 });
    assert.ok(screen.getByRole('spinbutton', { name: 'input-aria' }));
    assert.ok(screen.getByText("l'identifiant"));
    assert.dom('.element-qrocm-proposals__input--block').doesNotExist();
  });

  test('should be able to select an option', async function (assert) {
    // given
    const qrocm = {
      id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
      instruction: 'Instruction',
      proposals: [
        {
          input: 'premiere-partie',
          type: 'select',
          display: 'block',
          placeholder: '',
          ariaLabel: 'select-aria',
          options: [
            {
              id: '1',
              content: "l'identifiant",
            },
            {
              id: '2',
              content: "le fournisseur d'adresse mail",
            },
          ],
        },
      ],
      type: 'qrocm',
    };
    const screen = await render(<template><ModuleQrocm @element={{qrocm}} /></template>);

    // when
    await clickByName('select-aria');
    await screen.findByRole('listbox');
    await click(
      screen.queryByRole('option', {
        name: "le fournisseur d'adresse mail",
      }),
    );

    // then
    assert.dom(screen.getByRole('button', { name: 'select-aria' })).hasText("le fournisseur d'adresse mail");
    assert.ok(screen.getByRole('button', { name: 'Vérifier ma réponse' }));
  });

  test('should display an error message, and no feedback, if QROCM is validated without response', async function (assert) {
    // given
    const qrocm = prepareQrocm();
    const screen = await render(<template><ModuleQrocm @element={{qrocm}} /></template>);

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    assert.dom(screen.getByRole('alert')).exists();
    assert.dom(screen.queryByText('Correct!')).doesNotExist();
  });

  test('should hide the error message when QROCM is validated with response', async function (assert) {
    // given
    const qrocm = prepareQrocm();
    const givenonElementAnswerStub = function () {};

    const screen = await render(
      <template><ModuleQrocm @element={{qrocm}} @onAnswer={{givenonElementAnswerStub}} /></template>,
    );

    // when
    await click(screen.getByRole('button', { name: 'select-aria' }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: "le fournisseur d'adresse mail" }));
    await click(screen.getByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    assert
      .dom(screen.queryByRole('alert', { name: 'Pour valider, veuillez remplir tous les champs réponse.' }))
      .doesNotExist();
  });

  module('should call action, disable inputs, and send an event when verify button is clicked', function () {
    test('when proposal is an input', async function (assert) {
      // given
      const clock = sinon.useFakeTimers();
      const qrocm = {
        id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
        instruction: 'Instruction',
        proposals: [
          {
            input: 'symbole',
            type: 'input',
            inputType: 'text',
            size: 1,
            display: 'block',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            solutions: ['Réponse 1'],
          },
        ],
        feedbacks: {
          valid: {
            state: 'Correct!',
            diagnosis: 'Good job!',
          },
          invalid: {
            state: 'Wrong!',
            diagnosis: 'Too Bad!',
          },
        },
        type: 'qrocm',
      };
      const userResponse = 'user-response';
      const onElementAnswerSpy = sinon.spy();
      ENV.APP.MODULIX_VERIFICATION_RESPONSE_DELAY = 10;

      // when
      const screen = await render(
        <template><ModuleQrocm @element={{qrocm}} @onAnswer={{onElementAnswerSpy}} /></template>,
      );
      await fillIn(screen.getByLabelText('Réponse 1'), userResponse);

      const input = screen.getByRole('textbox', { name: 'Réponse 1' });
      const verifyButton = screen.queryByRole('button', { name: 'Vérifier ma réponse' });
      await click(verifyButton);

      // then
      assert.dom(input).hasAttribute('readonly');
      await clock.tick(ENV.APP.MODULIX_VERIFICATION_RESPONSE_DELAY);
      sinon.assert.calledWith(onElementAnswerSpy, {
        userResponse: [
          {
            input: 'symbole',
            answer: userResponse,
          },
        ],
        element: qrocm,
      });
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'QROCM_ANSWERED',
        data: {
          answer: [
            {
              input: 'symbole',
              answer: userResponse,
            },
          ],
          elementId: qrocm.id,
          status: 'ko',
        },
      });
      assert.ok(true);
      clock.restore();
    });

    test('when proposal is a select', async function (assert) {
      // given
      const qrocm = prepareQrocm();
      const userResponse = { input: 'premiere-partie', answer: '2' };
      const onElementAnswerSpy = sinon.spy();
      const screen = await render(
        <template><ModuleQrocm @element={{qrocm}} @onAnswer={{onElementAnswerSpy}} /></template>,
      );
      const verifyButton = screen.queryByRole('button', { name: 'Vérifier ma réponse' });

      // when
      await clickByName('select-aria');
      await screen.findByRole('listbox');
      await click(
        screen.queryByRole('option', {
          name: "le fournisseur d'adresse mail",
        }),
      );
      await click(verifyButton);

      // then
      sinon.assert.calledWith(onElementAnswerSpy, { userResponse: [userResponse], element: qrocm });
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'QROCM_ANSWERED',
        data: {
          answer: [userResponse],
          elementId: qrocm.id,
          status: 'ko',
        },
      });
      assert.ok(true);
    });
  });

  test('should display an ok feedback when exists', async function (assert) {
    // given
    const qrocm = prepareQrocm();
    const givenonElementAnswerStub = function () {};

    // when
    const screen = await render(
      <template><ModuleQrocm @element={{qrocm}} @onAnswer={{givenonElementAnswerStub}} /></template>,
    );
    await click(screen.getByRole('button', { name: 'select-aria' }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: "l'identifiant" }));
    await click(screen.getByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    assert.dom(screen.getByText('Correct!')).exists();
    assert.dom(screen.getByText('Good job!')).exists();
    assert.dom(screen.queryByRole('button', { name: 'Vérifier ma réponse' })).doesNotExist();
  });

  test('should display a ko feedback when exists', async function (assert) {
    // given
    const qrocm = prepareQrocm();
    const givenonElementAnswerStub = function () {};

    // when
    const screen = await render(
      <template><ModuleQrocm @element={{qrocm}} @onAnswer={{givenonElementAnswerStub}} /></template>,
    );
    await click(screen.getByRole('button', { name: 'select-aria' }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: "le fournisseur d'adresse mail" }));
    await click(screen.getByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    assert.dom(screen.getByText('Wrong!')).exists();
    assert.dom(screen.getByText('Too Bad!')).exists();
    assert.dom(screen.queryByRole('button', { name: 'Vérifier ma réponse' })).doesNotExist();
  });

  test('should display retry button when a ko feedback appears', async function (assert) {
    // given
    const qrocm = prepareQrocm();
    const givenonElementAnswerStub = function () {};

    // when
    const screen = await render(
      <template><ModuleQrocm @element={{qrocm}} @onAnswer={{givenonElementAnswerStub}} /></template>,
    );
    await click(screen.getByRole('button', { name: 'select-aria' }));
    await screen.findByRole('listbox');
    await click(screen.getByRole('option', { name: "le fournisseur d'adresse mail" }));
    await click(screen.getByRole('button', { name: 'Vérifier ma réponse' }));

    // then
    assert.dom(screen.queryByRole('button', { name: 'Réessayer' })).exists();
  });

  module('when user clicks on retry button', function () {
    test('should send an event', async function (assert) {
      // given
      const clock = sinon.useFakeTimers();
      const qrocm = {
        id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
        instruction: 'Instruction',
        proposals: [
          {
            input: 'symbole',
            type: 'input',
            inputType: 'text',
            size: 1,
            display: 'block',
            placeholder: '',
            ariaLabel: 'Réponse 1',
            solutions: ['Réponse 1'],
          },
        ],
        feedbacks: {
          valid: {
            state: 'Correct!',
            diagnosis: 'Good job!',
          },
          invalid: {
            state: 'Wrong!',
            diagnosis: 'Too Bad!',
          },
        },
        type: 'qrocm',
      };
      const onElementAnswerStub = sinon.stub();
      const onRetrySpy = sinon.spy();
      ENV.APP.MODULIX_VERIFICATION_RESPONSE_DELAY = 10;

      // when
      const screen = await render(
        <template>
          <ModuleQrocm @element={{qrocm}} @onAnswer={{onElementAnswerStub}} @onRetry={{onRetrySpy}} />
        </template>,
      );
      await fillIn(screen.getByLabelText('Réponse 1'), 'ma super réponse');
      const verifyButton = screen.queryByRole('button', { name: 'Vérifier ma réponse' });
      await click(verifyButton);
      await clock.tickAsync(ENV.APP.MODULIX_VERIFICATION_RESPONSE_DELAY);
      const retryButton = screen.getByRole('button', { name: 'Réessayer' });
      await click(retryButton);

      // then
      sinon.assert.calledWith(onRetrySpy, {
        element: qrocm,
      });
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'QROCM_RETRIED',
        data: {
          elementId: qrocm.id,
        },
      });
      assert.ok(true);
      clock.restore();
    });
  });

  test('should be able to focus back an input to proposals when feedback appears', async function (assert) {
    // given
    const qrocm = {
      id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
      instruction: 'Mon instruction',
      proposals: [
        {
          input: 'symbole',
          inputType: 'text',
          display: 'block',
          size: 1,
          placeholder: '',
          ariaLabel: 'input-aria',
          type: 'input',
        },
      ],
      type: 'qrocm',
    };
    const givenonElementAnswerStub = function () {};

    // when
    const screen = await render(
      <template><ModuleQrocm @element={{qrocm}} @onAnswer={{givenonElementAnswerStub}} /></template>,
    );

    // then
    const textbox = screen.getByRole('textbox', { name: 'input-aria', disabled: true });
    textbox.focus();
    assert.deepEqual(document.activeElement, textbox);
  });

  test('should be able to focus back a select to proposals when feedback appears', async function (assert) {
    // given
    const qrocm = prepareQrocm();
    const givenonElementAnswerStub = function () {};

    // when
    const screen = await render(
      <template><ModuleQrocm @element={{qrocm}} @onAnswer={{givenonElementAnswerStub}} /></template>,
    );

    // then
    const selectButton = screen.getByRole('button', { name: 'select-aria', disabled: true });
    selectButton.focus();
    assert.deepEqual(document.activeElement, selectButton);
  });

  test('should not display retry button when an ok feedback appears', async function (assert) {
    // given
    const qrocm = prepareQrocm();
    const givenonElementAnswerStub = function () {};

    // when
    const screen = await render(
      <template><ModuleQrocm @element={{qrocm}} @onAnswer={{givenonElementAnswerStub}} /></template>,
    );

    // then
    assert.dom(screen.queryByRole('button', { name: 'Réessayer' })).doesNotExist();
  });

  module('when preview mode is enabled', function () {
    test('should display all feedbacks', async function (assert) {
      // given
      class PreviewModeServiceStub extends Service {
        isEnabled = true;
      }

      this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);
      const qrocm = prepareQrocm();

      // when
      const screen = await render(<template><ModuleQrocm @element={{qrocm}} /></template>);

      // then
      assert.dom(screen.getByText('Correct!')).exists();
      assert.dom(screen.getByText('Good job!')).exists();
      assert.dom(screen.getByText('Wrong!')).exists();
      assert.dom(screen.getByText('Too Bad!')).exists();
    });
  });

  module('when input type is text', function () {
    module('when no answer is provided by the user and verify button is clicked', function () {
      test('it should still be possible to answer and verify response', async function (assert) {
        const clock = sinon.useFakeTimers();
        const qrocm = {
          id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
          instruction: 'Instruction',
          proposals: [
            {
              input: 'symbole',
              type: 'input',
              inputType: 'text',
              size: 1,
              display: 'block',
              placeholder: '',
              ariaLabel: 'Réponse 1',
              solutions: ['Réponse 1'],
            },
          ],
          feedbacks: {
            valid: {
              state: 'Correct!',
              diagnosis: 'Good job!',
            },
            invalid: {
              state: 'Wrong!',
              diagnosis: 'Too Bad!',
            },
          },
          type: 'qrocm',
        };
        ENV.APP.MODULIX_VERIFICATION_RESPONSE_DELAY = 10;
        const onElementAnswerSpy = sinon.stub();

        // when
        const screen = await render(
          <template><ModuleQrocm @element={{qrocm}} @onAnswer={{onElementAnswerSpy}} /></template>,
        );
        const input = screen.getByRole('textbox', { name: 'Réponse 1' });
        const verifyButton = screen.queryByRole('button', { name: 'Vérifier ma réponse' });
        await click(verifyButton);

        // then
        await clock.tick(ENV.APP.MODULIX_VERIFICATION_RESPONSE_DELAY + 1);
        assert.dom(input).hasNoAttribute('readonly');

        await fillIn(screen.getByLabelText('Réponse 1'), 'Réponse 1');
        await click(verifyButton);
        await clock.tickAsync(ENV.APP.MODULIX_VERIFICATION_RESPONSE_DELAY + 1);
        assert.dom(screen.getByText('Correct!')).exists();
        assert.dom(screen.getByText('Good job!')).exists();
        assert.ok(true);

        clock.restore();
      });
    });
  });
});

function prepareQrocm() {
  return {
    id: '994b6a96-a3c2-47ae-a461-87548ac6e02b',
    instruction: 'Instruction',
    proposals: [
      {
        input: 'premiere-partie',
        type: 'select',
        display: 'block',
        placeholder: '',
        ariaLabel: 'select-aria',
        options: [
          {
            id: '1',
            content: "l'identifiant",
          },
          {
            id: '2',
            content: "le fournisseur d'adresse mail",
          },
        ],
        solutions: ['1'],
      },
    ],
    feedbacks: {
      valid: {
        state: 'Correct!',
        diagnosis: 'Good job!',
      },
      invalid: {
        state: 'Wrong!',
        diagnosis: 'Too Bad!',
      },
    },
    type: 'qrocm',
  };
}
