import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { VERIFY_RESPONSE_DELAY } from 'mon-pix/components/module/component/element';
import ModuleQcuDiscovery from 'mon-pix/components/module/element/qcu-discovery';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { waitForDialog } from '../../../helpers/wait-for';

module('Integration | Component | Module | QCUDiscovery', function (hooks) {
  setupIntlRenderingTest(hooks);

  let clock;

  hooks.beforeEach(function () {
    clock = sinon.useFakeTimers();
  });

  hooks.afterEach(function () {
    clock.restore();
  });

  test('it should display an instruction, a direction and a list of proposals', async function (assert) {
    // given
    const qcuDiscoveryElement = _getQcuDiscoveryElement();
    const { proposals } = qcuDiscoveryElement;

    // when
    const screen = await render(<template><ModuleQcuDiscovery @element={{qcuDiscoveryElement}} /></template>);

    // then
    assert.ok(screen.getByText('Quel est le dessert classique idéal lors d’un goûter ?'));
    assert.deepEqual(screen.getAllByText(t('pages.modulix.qcuDiscovery.direction')).length, 2);
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

      const qcuDiscoveryElement = _getQcuDiscoveryElement();
      const { proposals } = qcuDiscoveryElement;

      // when
      const screen = await render(
        <template><ModuleQcuDiscovery @element={{qcuDiscoveryElement}} @onAnswer={{onAnswerStub}} /></template>,
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
      assert.ok(screen.getByText('Il n’y a rien de plus réconfortant que des cookies tout juste sortis du four !'));
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'QCU_DISCOVERY_ANSWERED',
        data: {
          elementId: qcuDiscoveryElement.id,
          answer: proposals[0].id,
          status: 'ok',
        },
      });
    });

    test('it should call "onAnswer" function pass as argument', async function (assert) {
      // given
      const passageEventService = this.owner.lookup('service:passageEvents');
      sinon.stub(passageEventService, 'record');
      const onAnswerStub = sinon.stub();

      const qcuDiscoveryElement = _getQcuDiscoveryElement();
      const { proposals } = qcuDiscoveryElement;

      // when
      const screen = await render(
        <template><ModuleQcuDiscovery @element={{qcuDiscoveryElement}} @onAnswer={{onAnswerStub}} /></template>,
      );
      const button1 = screen.getByRole('button', { name: proposals[0].content });
      await click(button1);

      await clock.tickAsync(VERIFY_RESPONSE_DELAY + 10);

      // then
      sinon.assert.calledWithExactly(onAnswerStub, {
        element: qcuDiscoveryElement,
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
      const qcuDiscoveryElement = _getQcuDiscoveryElement();

      // when
      const screen = await render(<template><ModuleQcuDiscovery @element={{qcuDiscoveryElement}} /></template>);

      // then
      assert
        .dom(screen.getByText('Il n’y a rien de plus réconfortant que des cookies tout juste sortis du four !'))
        .exists();
      assert
        .dom(
          screen.getByText(
            'Les éclairs, c’est un peu l’élégance à l’état pur. Légers, crémeux, et surtout irrésistibles.',
          ),
        )
        .exists();
      assert
        .dom(screen.getByText('Parfait pour ceux qui préfèrent un goûter plus léger, mais tout aussi délicieux.'))
        .exists();
      assert
        .dom(
          screen.getByText(
            'Un gâteau moelleux et gourmand qui se marie parfaitement avec une tasse de thé ou de café.',
          ),
        )
        .exists();
    });
  });

  test('should display report button', async function (assert) {
    // given
    const passageEventService = this.owner.lookup('service:passageEvents');
    sinon.stub(passageEventService, 'record');
    const onAnswerStub = sinon.stub();

    const qcuDiscoveryElement = _getQcuDiscoveryElement();
    const { proposals } = qcuDiscoveryElement;

    // when
    const screen = await render(
      <template><ModuleQcuDiscovery @element={{qcuDiscoveryElement}} @onAnswer={{onAnswerStub}} /></template>,
    );
    const button1 = screen.getByRole('button', { name: proposals[0].content });
    await click(button1);

    await clock.tickAsync(VERIFY_RESPONSE_DELAY + 10);

    // then
    assert.dom(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') })).exists();
  });

  module('when user clicks on report button', function () {
    test('should display issue-report modal with a form inside', async function (assert) {
      // given
      const passageEventService = this.owner.lookup('service:passageEvents');
      sinon.stub(passageEventService, 'record');
      const onAnswerStub = sinon.stub();

      const qcuDiscoveryElement = _getQcuDiscoveryElement();
      const { proposals } = qcuDiscoveryElement;

      // when
      const screen = await render(
        <template>
          <div id="modal-container"></div>
          <ModuleQcuDiscovery @element={{qcuDiscoveryElement}} @onAnswer={{onAnswerStub}} />
        </template>,
      );
      const button1 = screen.getByRole('button', { name: proposals[0].content });
      await click(button1);

      await clock.tickAsync(VERIFY_RESPONSE_DELAY + 10);

      await click(screen.getByRole('button', { name: t('pages.modulix.issue-report.aria-label') }));
      await waitForDialog();

      // then
      assert.dom(screen.getByRole('dialog')).exists();
      assert.dom(screen.getByRole('heading', { name: t('pages.modulix.issue-report.modal.title'), level: 1 })).exists();
    });
  });

  module('when qcu discovery has short proposals', function () {
    test('should display proposals in a grid', async function (assert) {
      // given
      const hasShortProposals = true;
      const qcuDiscoveryElementWithShortProposals = _getQcuDiscoveryElement(hasShortProposals);
      const { proposals } = qcuDiscoveryElementWithShortProposals;

      // when
      const screen = await render(
        <template><ModuleQcuDiscovery @element={{qcuDiscoveryElementWithShortProposals}} /></template>,
      );

      // then
      assert
        .dom(screen.getByRole('button', { name: proposals[0].content }).parentElement)
        .hasClass('element-qcu-discovery__short-proposals');
    });
  });
});

function _getQcuDiscoveryElement(hasShortProposals = false) {
  const instruction = '<p>Quel est le dessert classique idéal lors d’un goûter&nbsp;?</p>';
  const solution = '1';

  const proposals = [
    {
      id: '1',
      content: 'Des cookies maison tout chauds',
      feedback: {
        diagnosis: '<p>Il n’y a rien de plus réconfortant que des cookies tout juste sortis du four !</p>',
      },
    },
    {
      id: '2',
      content: 'Des mini-éclairs au chocolat',
      feedback: {
        diagnosis:
          '<p>Les éclairs, c’est un peu l’élégance à l’état pur. Légers, crémeux, et surtout irrésistibles.</p>',
      },
    },
    {
      id: '3',
      content: 'Un plateau de fruits frais et de fromage',
      feedback: {
        diagnosis: '<p>Parfait pour ceux qui préfèrent un goûter plus léger, mais tout aussi délicieux.</p>',
      },
    },
    {
      id: '4',
      content: 'Une part de gâteau marbré au chocolat et à la vanille',
      feedback: {
        diagnosis: '<p>Un gâteau moelleux et gourmand qui se marie parfaitement avec une tasse de thé ou de café.</p>',
      },
    },
  ];

  return { id: '0c397035-a940-441f-8936-050db7f997af', hasShortProposals, instruction, proposals, solution };
}
