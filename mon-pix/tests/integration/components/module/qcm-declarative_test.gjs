import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
// eslint-disable-next-line no-restricted-imports
import { click, find } from '@ember/test-helpers';
import { VERIFY_RESPONSE_DELAY } from 'mon-pix/components/module/component/element';
import ModuleQcmDeclarative from 'mon-pix/components/module/element/qcm-declarative';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | QcmDeclarative', function (hooks) {
  setupIntlRenderingTest(hooks);

  let clock;

  hooks.beforeEach(function () {
    clock = sinon.useFakeTimers();
  });

  hooks.afterEach(function () {
    clock.restore();
  });

  test('it should display an instruction, a complementary instruction and a list of proposals', async function (assert) {
    // given
    const qcmDeclarativeElement = _getQcmDeclarativeElement();
    const { complementaryInstruction, proposals } = qcmDeclarativeElement;

    // when
    const screen = await render(<template><ModuleQcmDeclarative @element={{qcmDeclarativeElement}} /></template>);
    const form = find('form');
    const submitButton = screen.getByRole('button', { name: 'Soumettre ma sélection' });

    // then
    assert.dom(form).exists();
    assert.ok(screen.getByText('Lesquels de ces oiseaux croisez-vous près de chez vous ?'));
    assert.ok(screen.getByText(complementaryInstruction));
    assert.strictEqual(screen.getAllByRole('checkbox').length, qcmDeclarativeElement.proposals.length);
    assert.ok(screen.getByLabelText(proposals[0].content));
    assert.ok(screen.getByLabelText(proposals[1].content));
    assert.ok(screen.getByLabelText(proposals[2].content));
    assert.ok(screen.getByLabelText(proposals[3].content));
    assert.dom(submitButton).exists();
  });

  module('when user clicks on several propositions and submit', function () {
    test('should disable interaction, call action, send an event when submit button is clicked, then display feedback and hide submit button', async function (assert) {
      // given
      const onAnswerStub = sinon.stub();
      const passageEventService = this.owner.lookup('service:passageEvents');
      sinon.stub(passageEventService, 'record');
      const qcmDeclarativeElement = _getQcmDeclarativeElement();
      const { proposals, feedback } = qcmDeclarativeElement;

      // when
      const screen = await render(
        <template><ModuleQcmDeclarative @element={{qcmDeclarativeElement}} @onAnswer={{onAnswerStub}} /></template>,
      );

      const proposal1Element = screen.getByLabelText(proposals[0].content);
      const proposal2Element = screen.getByLabelText(proposals[1].content);
      const proposal3Element = screen.getByLabelText(proposals[2].content);
      const proposal4Element = screen.getByLabelText(proposals[3].content);
      await click(proposal1Element);
      await click(proposal3Element);

      const submitButton = screen.getByRole('button', { name: 'Soumettre ma sélection' });
      await click(submitButton);

      // then
      assert.dom(proposal1Element).hasAria('disabled', 'true');
      assert.dom(proposal2Element).hasAria('disabled', 'true');
      assert.dom(proposal3Element).hasAria('disabled', 'true');
      assert.dom(proposal4Element).hasAria('disabled', 'true');
      await clock.tickAsync(VERIFY_RESPONSE_DELAY);
      sinon.assert.calledWith(onAnswerStub, { element: qcmDeclarativeElement });

      assert.dom(screen.getByText(feedback.diagnosis)).exists();

      assert.dom(screen.queryByRole('button', { name: 'Soumettre ma sélection' })).doesNotExist();
      assert.dom(screen.getByText('Signaler')).exists();
    });

    test('should display selected proposals with declarative-selected state and unselected proposals with declarative state', async function (assert) {
      // given
      const onAnswerStub = sinon.stub();
      const passageEventService = this.owner.lookup('service:passageEvents');
      sinon.stub(passageEventService, 'record');
      const qcmDeclarativeElement = _getQcmDeclarativeElement();
      const { proposals } = qcmDeclarativeElement;

      const screen = await render(
        <template><ModuleQcmDeclarative @element={{qcmDeclarativeElement}} @onAnswer={{onAnswerStub}} /></template>,
      );

      const proposal1Element = screen.getByLabelText(proposals[0].content);
      const proposal2Element = screen.getByLabelText(proposals[1].content);
      await click(proposal1Element);

      // when
      const submitButton = screen.getByRole('button', { name: 'Soumettre ma sélection' });
      await click(submitButton);

      // then - state is determined by selectedProposalIds, correct before timer resolves
      assert.dom(proposal1Element.closest('label')).hasClass('pix-label-wrapped--state-modulix-declarative-selected');
      assert.dom(proposal2Element.closest('label')).hasClass('pix-label-wrapped--state-modulix-declarative');

      await clock.tickAsync(VERIFY_RESPONSE_DELAY);
    });

    test('should not change proposal state when clicking a checkbox after submission', async function (assert) {
      // given
      const onAnswerStub = sinon.stub();
      const passageEventService = this.owner.lookup('service:passageEvents');
      sinon.stub(passageEventService, 'record');
      const qcmDeclarativeElement = _getQcmDeclarativeElement();
      const { proposals } = qcmDeclarativeElement;

      const screen = await render(
        <template><ModuleQcmDeclarative @element={{qcmDeclarativeElement}} @onAnswer={{onAnswerStub}} /></template>,
      );

      const proposal1Element = screen.getByLabelText(proposals[0].content);
      const proposal2Element = screen.getByLabelText(proposals[1].content);
      await click(proposal1Element);
      const submitButton = screen.getByRole('button', { name: 'Soumettre ma sélection' });
      await click(submitButton);
      await clock.tickAsync(VERIFY_RESPONSE_DELAY);

      // when - clicking after submission
      await click(proposal1Element);
      await click(proposal2Element);

      // then - states must not have changed
      assert.dom(proposal1Element.closest('label')).hasClass('pix-label-wrapped--state-modulix-declarative-selected');
      assert.dom(proposal2Element.closest('label')).hasClass('pix-label-wrapped--state-modulix-declarative');
    });

    test('it should record a passage-event', async function (assert) {
      // given
      const passageEventService = this.owner.lookup('service:passageEvents');
      const passageEventRecordStub = sinon.stub(passageEventService, 'record');
      const onAnswerStub = sinon.stub();

      const qcmDeclarativeElement = _getQcmDeclarativeElement();
      const { proposals } = qcmDeclarativeElement;

      // when
      const screen = await render(
        <template><ModuleQcmDeclarative @element={{qcmDeclarativeElement}} @onAnswer={{onAnswerStub}} /></template>,
      );
      const submitButton = screen.getByRole('button', { name: 'Soumettre ma sélection' });
      const proposal1Element = screen.getByLabelText(proposals[0].content);
      await click(proposal1Element);
      await submitButton.click();
      await clock.tickAsync(VERIFY_RESPONSE_DELAY + 10);

      // then
      sinon.assert.calledWithExactly(onAnswerStub, {
        element: qcmDeclarativeElement,
      });
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'QCM_DECLARATIVE_ANSWERED',
        data: {
          elementId: qcmDeclarativeElement.id,
          answer: '1',
        },
      });
      assert.ok(true);
    });
  });

  module('when no proposal is selected', function () {
    test('should display an error message when submit button is clicked', async function (assert) {
      // given
      const onAnswerStub = sinon.stub();
      const qcmDeclarativeElement = _getQcmDeclarativeElement();

      const screen = await render(
        <template><ModuleQcmDeclarative @element={{qcmDeclarativeElement}} @onAnswer={{onAnswerStub}} /></template>,
      );

      // when
      const submitButton = screen.getByRole('button', { name: 'Soumettre ma sélection' });
      await click(submitButton);
      await clock.tickAsync(VERIFY_RESPONSE_DELAY);

      // then
      assert.dom(screen.getByRole('alert')).exists();
      sinon.assert.notCalled(onAnswerStub);
    });
  });

  module('when preview mode is enable', function () {
    test('should display the feedback, without clicking any checkboxes nor submitting', async function (assert) {
      // given
      class PreviewModeServiceStub extends Service {
        isEnabled = true;
      }
      this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);
      const qcmDeclarativeElement = _getQcmDeclarativeElement();

      const { feedback } = qcmDeclarativeElement;

      // when
      const screen = await render(<template><ModuleQcmDeclarative @element={{qcmDeclarativeElement}} /></template>);

      // then
      assert.dom(screen.getByText(feedback.diagnosis)).exists();
    });
  });

  module('when qcm declarative has short proposals', function () {
    test('should display proposals in a grid', async function (assert) {
      // given
      const hasShortProposals = true;
      const qcmDeclarativeElementWithShortProposals = _getQcmDeclarativeElement(hasShortProposals);

      // when
      const screen = await render(
        <template><ModuleQcmDeclarative @element={{qcmDeclarativeElementWithShortProposals}} /></template>,
      );

      // then
      const proposalsGroup = screen.getByRole('region');
      assert.dom(proposalsGroup).hasClass('element-qcm-declarative__short-proposals');
    });
  });
});

function _getQcmDeclarativeElement(hasShortProposals = false) {
  const id = '0db62236-a758-4fbb-bbca-16d63d92ad6e';
  const instruction = '<p>Lesquels de ces oiseaux croisez-vous près de chez vous ?</p>';
  const complementaryInstruction = 'Sélectionnez la ou les réponses de votre choix.';

  const proposals = [
    {
      id: '1',
      content: 'Le moineau',
    },
    {
      id: '2',
      content: 'Le pigeon',
    },
    {
      id: '3',
      content: 'La mésange charbonière',
    },
    {
      id: '3',
      content: 'La huppe fasciée',
    },
  ];
  const feedback = {
    diagnosis: 'Vous en avez de la chance !',
  };

  return { id, instruction, hasShortProposals, complementaryInstruction, proposals, feedback };
}
