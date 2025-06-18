import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import ModuleQabElement, { NEXT_CARD_DELAY } from 'mon-pix/components/module/element/qab/qab';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | QAB', function (hooks) {
  setupIntlRenderingTest(hooks);

  let clock, passageEventService, passageEventRecordStub;

  hooks.beforeEach(function () {
    clock = sinon.useFakeTimers();
    passageEventService = this.owner.lookup('service:passageEvents');
    passageEventRecordStub = sinon.stub(passageEventService, 'record');
  });

  hooks.afterEach(function () {
    clock.restore();
    passageEventRecordStub.restore();
  });

  test('it should display a QAB with a single card with two proposal', async function (assert) {
    // given
    const qabElement = _getQabElement();

    // when
    const screen = await render(<template><ModuleQabElement @element={{qabElement}} /></template>);

    // then
    assert.ok(screen.getByText('Maintenant, entraînez-vous sur des exemples concrets !'));
    assert.ok(screen.getByText('Les boules de pétanques sont creuses.'));
    assert.ok(screen.getByRole('button', { name: 'Option A: Vrai' }));
    assert.ok(screen.getByRole('button', { name: 'Option B: Faux' }));
  });

  module('when proposal A is the solution', function () {
    test('should display the correct proposal as success', async function (assert) {
      // given
      const solution = 'A';
      const qabElement = _getQabElement(solution);

      // when
      const screen = await render(<template><ModuleQabElement @element={{qabElement}} /></template>);

      // then
      assert.dom(screen.getByRole('button', { name: 'Option A: Vrai' })).hasClass('qab-proposal-button--success');
      assert.dom(screen.getByRole('button', { name: 'Option B: Faux' })).hasClass('qab-proposal-button--error');
    });
  });

  module('when proposal B is the solution', function () {
    test('should display the correct proposal as success', async function (assert) {
      // given
      const solution = 'B';
      const qabElement = _getQabElement(solution);

      // when
      const screen = await render(<template><ModuleQabElement @element={{qabElement}} /></template>);

      // then
      assert.dom(screen.getByRole('button', { name: 'Option A: Vrai' })).hasClass('qab-proposal-button--error');
      assert.dom(screen.getByRole('button', { name: 'Option B: Faux' })).hasClass('qab-proposal-button--success');
    });
  });

  module('when user answers a card', function () {
    test('it should display the next card and send an event', async function (assert) {
      // given
      const qabElement = _getQabElement();

      // when
      const screen = await render(<template><ModuleQabElement @element={{qabElement}} /></template>);
      await click(screen.getByRole('button', { name: 'Option A: Vrai' }));
      await clock.tickAsync(NEXT_CARD_DELAY);

      // then
      sinon.assert.calledWithExactly(passageEventRecordStub, {
        type: 'QAB_CARD_ANSWERED',
        data: {
          cardId: qabElement.cards[0].id,
          chosenProposal: 'A',
          elementId: qabElement.id,
        },
      });

      assert.dom(screen.getByText('Les chiens ne transpirent pas.')).exists();
    });

    module('when user chooses proposal A', function () {
      test('should display proposal A as selected and card status as success', async function (assert) {
        // given
        const qabElement = _getQabElement();

        // when
        const screen = await render(<template><ModuleQabElement @element={{qabElement}} /></template>);
        await click(screen.getByRole('button', { name: 'Option A: Vrai' }));

        // then
        assert.dom(screen.getByRole('button', { name: 'Option A: Vrai' })).hasClass('qab-proposal-button--selected');
        assert.dom(screen.getByRole('button', { name: 'Option A: Vrai' })).isDisabled();
        assert
          .dom(screen.getByRole('button', { name: 'Option B: Faux' }))
          .doesNotHaveClass('qab-proposal-button--selected');
        assert.dom(screen.getByRole('button', { name: 'Option B: Faux' })).isDisabled();
        assert.dom(screen.getByRole('status')).hasText('Bonne réponse !');
      });
    });

    module('when user chooses proposal B', function () {
      test('should display proposal B as selected and card status as error', async function (assert) {
        // given
        const qabElement = _getQabElement();

        // when
        const screen = await render(<template><ModuleQabElement @element={{qabElement}} /></template>);
        await click(screen.getByRole('button', { name: 'Option B: Faux' }));

        // then
        assert
          .dom(screen.getByRole('button', { name: 'Option A: Vrai' }))
          .doesNotHaveClass('qab-proposal-button--selected');
        assert.dom(screen.getByRole('button', { name: 'Option A: Vrai' })).isDisabled();
        assert.dom(screen.getByRole('button', { name: 'Option B: Faux' })).hasClass('qab-proposal-button--selected');
        assert.dom(screen.getByRole('button', { name: 'Option B: Faux' })).isDisabled();
        assert.dom(screen.getByRole('status')).hasText('Mauvaise réponse.');
      });
    });

    module('when user answers the last card', function () {
      test('should display the score card and call "onAnswer" function passed as argument', async function (assert) {
        // given
        const qabElement = _getQabElement();
        const onAnswerStub = sinon.stub();

        // when
        const screen = await render(
          <template><ModuleQabElement @element={{qabElement}} @onAnswer={{onAnswerStub}} /></template>,
        );
        await click(screen.getByRole('button', { name: 'Option A: Vrai' }));
        await clock.tickAsync(NEXT_CARD_DELAY);
        await click(screen.getByRole('button', { name: 'Option A: Vrai' }));
        await clock.tickAsync(NEXT_CARD_DELAY);

        // then
        sinon.assert.calledWithExactly(onAnswerStub, {
          element: qabElement,
        });

        assert.dom(screen.getByText('Votre score : 1/2')).exists();
        assert.dom(screen.getByRole('button', { name: 'Réessayer' })).exists();
      });

      module('when user clicks the retry button', function () {
        test('should reset the component, display the first card and send an event', async function (assert) {
          // given
          const qabElement = _getQabElement();
          const onAnswerStub = sinon.stub();

          // when
          const screen = await render(
            <template><ModuleQabElement @element={{qabElement}} @onAnswer={{onAnswerStub}} /></template>,
          );
          await click(screen.getByRole('button', { name: 'Option A: Vrai' }));
          await clock.tickAsync(NEXT_CARD_DELAY);
          await click(screen.getByRole('button', { name: 'Option A: Vrai' }));
          await clock.tickAsync(NEXT_CARD_DELAY);
          await click(screen.getByRole('button', { name: 'Réessayer' }));

          // then

          assert.dom(screen.getByText('Les chiens ne transpirent pas.')).exists();
          assert.dom(screen.getByText('Maintenant, entraînez-vous sur des exemples concrets !')).exists();
          assert.dom(screen.getByText('Les boules de pétanques sont creuses.')).exists();

          const recordQabCardRetriedCall = passageEventRecordStub.getCall(2);
          assert.deepEqual(recordQabCardRetriedCall.args, [
            {
              type: 'QAB_CARD_RETRIED',
              data: {
                elementId: qabElement.id,
              },
            },
          ]);
        });
      });
    });
  });
});

function _getQabElement(solution = 'A') {
  return {
    id: 'ed795d29-5f04-499c-a9c8-4019125c5cb1',
    type: 'qab',
    instruction:
      '<p><strong>Maintenant, entraînez-vous sur des exemples concrets !</strong> </p> <p> Pour chaque exemple, choisissez si l’affirmation est <strong>vraie</strong> ou <strong>fausse</strong>.</p>',
    cards: [
      {
        id: 'e222b060-7c18-4ee2-afe2-2ae27c28946a',
        image: {
          url: 'https://assets.pix.org/modules/bac-a-sable/boules-de-petanque.jpg',
          altText: '',
        },
        text: 'Les boules de pétanques sont creuses.',
        proposalA: 'Vrai',
        proposalB: 'Faux',
        solution,
      },
      {
        id: '57056894-8e1b-4da9-96b6-0bd4187412b8',
        text: 'Les chiens ne transpirent pas.',
        proposalA: 'Vrai',
        proposalB: 'Faux',
        solution: 'B',
      },
    ],
  };
}
