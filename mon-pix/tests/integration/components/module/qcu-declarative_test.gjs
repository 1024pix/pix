import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { VERIFY_RESPONSE_DELAY } from 'mon-pix/components/module/component/element';
import ModuleQcuDeclarative from 'mon-pix/components/module/element/qcu-declarative';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { waitForDialog } from '../../../helpers/wait-for';

module('Integration | Component | Module | QCUDeclarative', function (hooks) {
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
    const qcuDeclarativeElement = _getQcuDeclarativeElement();
    const { complementaryInstruction, proposals } = qcuDeclarativeElement;

    // when
    const screen = await render(<template><ModuleQcuDeclarative @element={{qcuDeclarativeElement}} /></template>);

    // then
    assert.ok(screen.getByText('De quoi le ‘oui‘ a-t-il besoin pour gagner ?'));
    assert.ok(screen.getByText(complementaryInstruction));
    assert.ok(screen.getByRole('button', { name: proposals[0].content }));
    assert.ok(screen.getByRole('button', { name: proposals[1].content }));
    assert.ok(screen.getByRole('button', { name: proposals[2].content }));
  });

  module('when user clicks on one of the proposals', function () {
    test('it should show feedback, disable proposal buttons and send an event', async function (assert) {
      // given
      const passageEventService = this.owner.lookup('service:passageEvents');
      const passageEventRecordStub = sinon.stub(passageEventService, 'record');
      const onAnswerStub = sinon.stub();

      const qcuDeclarativeElement = _getQcuDeclarativeElement();
      const { proposals } = qcuDeclarativeElement;

      // when
      const screen = await render(
        <template><ModuleQcuDeclarative @element={{qcuDeclarativeElement}} @onAnswer={{onAnswerStub}} /></template>,
      );
      const button1 = screen.getByRole('button', { name: proposals[0].content });
      await click(button1);

      await clock.tickAsync(VERIFY_RESPONSE_DELAY + 10);

      // then
      const button2 = screen.getByRole('button', { name: proposals[1].content });
      const button3 = screen.getByRole('button', { name: proposals[2].content });
      assert.dom(button1).hasAttribute('aria-disabled');
      assert.dom(button2).hasAttribute('aria-disabled');
      assert.dom(button3).hasAttribute('aria-disabled');
      assert.ok(screen.getByText("C'est l'approche de la plupart des gens."));
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'QCU_DECLARATIVE_ANSWERED',
        data: {
          elementId: qcuDeclarativeElement.id,
          answer: proposals[0].content,
        },
      });
    });

    test('it should call "onAnswer" function pass as argument', async function (assert) {
      // given
      const passageEventService = this.owner.lookup('service:passageEvents');
      sinon.stub(passageEventService, 'record');
      const onAnswerStub = sinon.stub();

      const qcuDeclarativeElement = _getQcuDeclarativeElement();
      const { proposals } = qcuDeclarativeElement;

      // when
      const screen = await render(
        <template><ModuleQcuDeclarative @element={{qcuDeclarativeElement}} @onAnswer={{onAnswerStub}} /></template>,
      );
      const button1 = screen.getByRole('button', { name: proposals[0].content });
      await click(button1);

      await clock.tickAsync(VERIFY_RESPONSE_DELAY + 10);

      // then
      sinon.assert.calledWithExactly(onAnswerStub, {
        element: qcuDeclarativeElement,
      });
      assert.ok(true);
    });
  });

  module('when preview mode is enabled', function () {
    test('should display all feedbacks, without answering', async function (assert) {
      // given
      class PreviewModeServiceStub extends Service {
        isEnabled = true;
      }
      this.owner.register('service:modulixPreviewMode', PreviewModeServiceStub);
      const qcuDeclarativeElement = _getQcuDeclarativeElement();

      // when
      const screen = await render(<template><ModuleQcuDeclarative @element={{qcuDeclarativeElement}} /></template>);

      // then
      assert.dom(screen.getByText("C'est l'approche de la plupart des gens.")).exists();
      assert.dom(screen.getByText('Possible, mais attention à ne pas faire une rafarinade !')).exists();
      assert.dom(screen.getByText('Digne des plus grands acrobates !')).exists();
    });
  });

  test('should display report button', async function (assert) {
    // given
    const passageEventService = this.owner.lookup('service:passageEvents');
    sinon.stub(passageEventService, 'record');
    const qcuDeclarativeElement = _getQcuDeclarativeElement();
    const onAnswerStub = sinon.stub();

    // when
    const screen = await render(
      <template><ModuleQcuDeclarative @element={{qcuDeclarativeElement}} @onAnswer={{onAnswerStub}} /></template>,
    );
    const firstButton = screen.getByRole('button', { name: qcuDeclarativeElement.proposals[0].content });
    await click(firstButton);

    await clock.tickAsync(VERIFY_RESPONSE_DELAY + 10);

    // then
    assert.dom(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') })).exists();
  });

  module('when user clicks on report button', function () {
    test('should display issue-report modal with a form inside', async function (assert) {
      // given
      const passageEventService = this.owner.lookup('service:passageEvents');
      sinon.stub(passageEventService, 'record');
      const qcuDeclarativeElement = _getQcuDeclarativeElement();
      const onAnswerStub = sinon.stub();

      // when
      const screen = await render(
        <template>
          <div id="modal-container"></div>
          <ModuleQcuDeclarative @element={{qcuDeclarativeElement}} @onAnswer={{onAnswerStub}} />
        </template>,
      );
      const firstButton = screen.getByRole('button', { name: qcuDeclarativeElement.proposals[0].content });
      await click(firstButton);

      await clock.tickAsync(VERIFY_RESPONSE_DELAY + 10);

      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') }));
      await waitForDialog();

      // then
      assert.dom(screen.getByRole('dialog')).exists();
      assert.dom(screen.getByRole('heading', { name: t('pages.modulix.issue-report.modal.title'), level: 1 })).exists();
    });
  });

  module('when qcu declarative has short proposals', function () {
    test('should display proposals in a grid', async function (assert) {
      // given
      const hasShortProposals = true;
      const qcuDeclarativeElementWithShortProposals = _getQcuDeclarativeElement(hasShortProposals);
      const { proposals } = qcuDeclarativeElementWithShortProposals;

      // when
      const screen = await render(
        <template><ModuleQcuDeclarative @element={{qcuDeclarativeElementWithShortProposals}} /></template>,
      );

      // then
      assert
        .dom(screen.getByRole('button', { name: proposals[0].content }).parentElement)
        .hasClass('element-qcu-declarative__3-short-proposals');
    });
  });
});

function _getQcuDeclarativeElement(hasShortProposals = false) {
  const instruction = '<p>De quoi le ‘oui‘ a-t-il besoin pour gagner ?</p>';
  const complementaryInstruction = 'Il n’y a pas de bonne ou de mauvaise réponse.';

  const proposals = [
    {
      id: '1',
      content: 'Du ‘oui‘',
      feedback: {
        diagnosis: "<p>C'est l'approche de la plupart des gens.</p>",
      },
    },
    {
      id: '2',
      content: 'Du ‘non‘',
      feedback: {
        diagnosis: '<p>Possible, mais attention à ne pas faire une rafarinade !</p>',
      },
    },
    {
      id: '3',
      content: 'Du ‘peut-être‘',
      feedback: {
        diagnosis: '<p>Digne des plus grands acrobates !</p>',
      },
    },
  ];

  return { instruction, hasShortProposals, complementaryInstruction, proposals };
}
