import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { VERIFY_RESPONSE_DELAY } from 'mon-pix/components/module/component/element';
import ModulixQcm from 'mon-pix/components/module/element/qcm';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | QCM', function (hooks) {
  setupIntlRenderingTest(hooks);

  let passageEventService, passageEventRecordStub;
  let clock;
  const updateSkipButton = sinon.stub();

  hooks.beforeEach(function () {
    clock = sinon.useFakeTimers();
    passageEventService = this.owner.lookup('service:passageEvents');
    passageEventRecordStub = sinon.stub(passageEventService, 'record');
  });

  hooks.afterEach(function () {
    clock.restore();
    passageEventRecordStub.restore();
  });

  test('should display a QCM', async function (assert) {
    // given
    const qcmElement = {
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'checkbox1' },
        { id: '2', content: 'checkbox2' },
        { id: '3', content: 'checkbox3' },
      ],
      type: 'qcm',
    };
    const screen = await render(<template><ModulixQcm @element={{qcmElement}} /></template>);

    // then
    assert.ok(screen);
    assert.ok(screen.getByRole('group', { legend: t('pages.modulix.qcm.direction') }));

    // Pas possible de faire un `getByRole('form')`. Voir https://github.com/1024pix/pix/pull/8835#discussion_r1596407648
    const form = find('form');
    assert.dom(form).exists();
    const formDescription = find(`#${form.getAttribute('aria-describedby')}`);
    assert.dom(formDescription).hasText('Instruction');

    assert.strictEqual(screen.getAllByRole('checkbox').length, qcmElement.proposals.length);
    assert.ok(screen.getByLabelText('checkbox1'));
    assert.ok(screen.getByLabelText('checkbox2'));
    assert.ok(screen.getByLabelText('checkbox3'));

    const verifyButton = screen.queryByRole('button', { name: 'Vérifier ma réponse' });
    assert.dom(verifyButton).exists();
  });

  test('should disable interaction, call action and send an event when verify button is clicked', async function (assert) {
    // given
    const answeredProposal = [
      { id: '1', content: 'select1' },
      { id: '2', content: 'select2' },
    ];
    const qcmElement = {
      id: 'qcm-id-1',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'select1' },
        { id: '2', content: 'select2' },
        { id: '3', content: 'select3' },
      ],
      feedbacks: {
        valid: 'Bravo',
        invalid: 'Pas bravo',
      },
      solutions: ['1', '3'],
      type: 'qcm',
    };
    const userResponse = [answeredProposal[0].id, answeredProposal[1].id];
    const onAnswerSpy = sinon.spy();

    // when
    const screen = await render(
      <template>
        <ModulixQcm @element={{qcmElement}} @onAnswer={{onAnswerSpy}} @updateSkipButton={{updateSkipButton}} />
      </template>,
    );
    const proposal1Element = screen.getByLabelText(qcmElement.proposals[0].content);
    const proposal2Element = screen.getByLabelText(qcmElement.proposals[1].content);
    const proposal3Element = screen.getByLabelText(qcmElement.proposals[2].content);
    await click(proposal1Element);
    await click(proposal2Element);

    const verifyButton = screen.queryByRole('button', { name: 'Vérifier ma réponse' });
    await click(verifyButton);

    // then
    assert.dom(proposal1Element).hasAria('disabled', 'true');
    assert.dom(proposal2Element).hasAria('disabled', 'true');
    assert.dom(proposal3Element).hasAria('disabled', 'true');
    await clock.tickAsync(VERIFY_RESPONSE_DELAY);
    sinon.assert.calledWith(onAnswerSpy, { userResponse, element: qcmElement });
    sinon.assert.calledWithExactly(passageEventRecordStub, {
      type: 'QCM_ANSWERED',
      data: {
        answer: [answeredProposal[0].id, answeredProposal[1].id],
        elementId: qcmElement.id,
        status: 'ko',
      },
    });
    assert.ok(true);
  });

  test('should display an error message if QCM is validated with less than two responses', async function (assert) {
    // given
    const qcmElement = {
      id: 'a6838f8e-05ee-42e0-9820-13a9977cf5dc',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'checkbox1' },
        { id: '2', content: 'checkbox2' },
        { id: '3', content: 'checkbox3' },
      ],
      feedbacks: {
        valid: 'Bravo',
        invalid: 'Pas bravo',
      },
      solutions: ['1', '2'],
      type: 'qcm',
    };
    const onAnswerSpy = sinon.spy();
    const screen = await render(
      <template>
        <ModulixQcm @element={{qcmElement}} @onAnswer={{onAnswerSpy}} @updateSkipButton={{updateSkipButton}} />
      </template>,
    );

    // when
    await click(screen.getByLabelText('checkbox1'));
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));
    await clock.tickAsync(VERIFY_RESPONSE_DELAY);

    // then
    assert.dom(screen.getByRole('alert')).exists();
    sinon.assert.notCalled(onAnswerSpy);
  });

  test('should hide the error message when QCM is validated with response', async function (assert) {
    // given
    const qcmElement = {
      id: 'a6838f8e-05ee-42e0-9820-13a9977cf5dc',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'checkbox1' },
        { id: '2', content: 'checkbox2' },
        { id: '3', content: 'checkbox3' },
      ],
      feedbacks: {
        valid: {
          state: 'Correct&#8239;!',
          diagnosis: '<p>Vous nous avez bien cernés&nbsp;:)</p>',
        },
        invalid: {
          state: 'Pas Bravo!',
          diagnosis: '<p>Vous nous avez mal cernés</p>',
        },
      },
      solutions: ['1', '2'],
      type: 'qcm',
    };
    const onAnswerSpy = sinon.spy();
    const screen = await render(
      <template>
        <ModulixQcm @element={{qcmElement}} @onAnswer={{onAnswerSpy}} @updateSkipButton={{updateSkipButton}} />
      </template>,
    );

    // when
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));
    await clock.tickAsync(VERIFY_RESPONSE_DELAY);
    await click(screen.getByLabelText('checkbox1'));
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));
    await clock.tickAsync(VERIFY_RESPONSE_DELAY);

    // then
    assert.dom(screen.queryByRole('alert', { name: 'Pour valider, sélectionnez une réponse.' })).doesNotExist();
  });

  test('should display an ok feedback with no retry button, when feedback exists', async function (assert) {
    // given
    const qcmElement = {
      id: 'a6838f8e-05ee-42e0-9820-13a9977cf5dc',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'checkbox1' },
        { id: '2', content: 'checkbox2' },
        { id: '3', content: 'checkbox3' },
      ],
      feedbacks: {
        valid: {
          state: 'Correct!',
          diagnosis: '<p>Good job!</p>',
        },
        invalid: {
          state: 'Pas Bravo!',
          diagnosis: '<p>Vous nous avez mal cernés</p>',
        },
      },
      solutions: ['1', '2'],
      type: 'qcm',
    };
    const onAnswerSpy = sinon.spy();

    // when
    const screen = await render(
      <template>
        <ModulixQcm @element={{qcmElement}} @onAnswer={{onAnswerSpy}} @updateSkipButton={{updateSkipButton}} />
      </template>,
    );
    await click(screen.getByLabelText('checkbox1'));
    await click(screen.getByLabelText('checkbox2'));
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));
    await clock.tickAsync(VERIFY_RESPONSE_DELAY);

    // then
    assert.dom(screen.getByText('Correct!')).exists();
    assert.dom(screen.getByText('Good job!')).exists();
    assert.ok(screen.getByRole('checkbox', { name: 'checkbox1', disabled: true }));
    assert.ok(screen.getByRole('checkbox', { name: 'checkbox2', disabled: true }));
    assert.ok(screen.getByRole('checkbox', { name: 'checkbox3', disabled: true }));
    assert.dom(screen.queryByRole('button', { name: 'Vérifier ma réponse' })).doesNotExist();
    assert.dom(screen.queryByRole('button', { name: 'Réessayer' })).doesNotExist();
  });

  test('should display a ko feedback and Retry button, when feedback exists', async function (assert) {
    // given
    const qcmElement = {
      id: 'a6838f8e-05ee-42e0-9820-13a9977cf5dc',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'checkbox1' },
        { id: '2', content: 'checkbox2' },
        { id: '3', content: 'checkbox3' },
      ],
      feedbacks: {
        valid: {
          state: 'Correct!',
          diagnosis: '<p>Good job!</p>',
        },
        invalid: {
          state: 'Wrong!',
          diagnosis: '<p>Too Bad!</p>',
        },
      },
      solutions: ['1', '2'],
      type: 'qcm',
    };
    const onAnswerSpy = sinon.spy();

    // when
    const screen = await render(
      <template>
        <ModulixQcm @element={{qcmElement}} @onAnswer={{onAnswerSpy}} @updateSkipButton={{updateSkipButton}} />
      </template>,
    );
    await click(screen.getByLabelText('checkbox1'));
    await click(screen.getByLabelText('checkbox3'));
    await click(screen.queryByRole('button', { name: 'Vérifier ma réponse' }));
    await clock.tickAsync(VERIFY_RESPONSE_DELAY);

    // then
    assert.dom(screen.getByText('Wrong!')).exists();
    assert.dom(screen.getByText('Too Bad!')).exists();
    assert.ok(screen.getByRole('checkbox', { name: 'checkbox1', disabled: true }));
    assert.ok(screen.getByRole('checkbox', { name: 'checkbox2', disabled: true }));
    assert.ok(screen.getByRole('checkbox', { name: 'checkbox3', disabled: true }));
    assert.dom(screen.queryByRole('button', { name: 'Vérifier ma réponse' })).doesNotExist();
    assert.dom(screen.queryByRole('button', { name: 'Réessayer' })).exists();
  });

  test('should be able to focus back to proposals when feedback appears', async function (assert) {
    // given
    const qcmElement = {
      id: 'a6838f8e-05ee-42e0-9820-13a9977cf5dc',
      instruction: 'Instruction',
      proposals: [
        { id: '1', content: 'checkbox1' },
        { id: '2', content: 'checkbox2' },
        { id: '3', content: 'checkbox3' },
      ],
      feedbacks: {
        valid: {
          state: 'Correct!',
          diagnosis: '<p>Good job!</p>',
        },
        invalid: {
          state: 'Wrong!',
          diagnosis: '<p>Too Bad!</p>',
        },
      },
      solutions: ['1', '2'],
      type: 'qcm',
    };
    const onAnswerSpy = sinon.spy();

    // when
    const screen = await render(
      <template>
        <ModulixQcm @element={{qcmElement}} @onAnswer={{onAnswerSpy}} @updateSkipButton={{updateSkipButton}} />
      </template>,
    );

    // then
    const checkbox1 = screen.getByRole('checkbox', { name: 'checkbox1', disabled: true });
    checkbox1.focus();
    assert.deepEqual(document.activeElement, checkbox1);
  });

  module('when preview mode is enabled', function () {
    test('should display all feedbacks', async function (assert) {
      // given
      class PreviewModeServiceStub extends Service {
        isEnabled = true;
      }
      this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);
      const qcm = {
        id: 'a2638f8e-05ee-42e0-9820-13a9977cf5dc',
        instruction: 'Instruction',
        proposals: [
          { id: '1', content: 'checkbox1' },
          { id: '2', content: 'checkbox2' },
          { id: '3', content: 'checkbox3' },
        ],
        feedbacks: {
          valid: {
            state: 'Correct!',
            diagnosis: '<p>Good job!</p>',
          },
          invalid: {
            state: 'Wrong!',
            diagnosis: '<p>Too Bad!</p>',
          },
        },
        solutions: ['1', '2'],
        type: 'qcm',
      };

      // when
      const screen = await render(
        <template><ModulixQcm @element={{qcm}} @updateSkipButton={{updateSkipButton}} /></template>,
      );

      // then
      assert.dom(screen.getByText('Correct!')).exists();
      assert.dom(screen.getByText('Good job!')).exists();
      assert.dom(screen.getByText('Wrong!')).exists();
      assert.dom(screen.getByText('Too Bad!')).exists();
    });
  });
});
