import { clickByName, render } from '@1024pix/ember-testing-library';
import PixAccordions from '@1024pix/pix-ui/components/pix-accordions';
import { waitUntil } from '@ember/test-helpers';
import ExpandableAccordions from 'pix-admin/components/common/expandable-accordions';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Common::ExpandableAccordions', function (hooks) {
  setupIntlRenderingTest(hooks);

  function isExpanded(screen, name) {
    return screen.getByRole('button', { name }).getAttribute('aria-expanded') === 'true';
  }

  async function renderTwoAccordions() {
    return render(
      <template>
        <ExpandableAccordions>
          <PixAccordions>
            <:title>Domaine 1</:title>
            <:content>Contenu domaine 1</:content>
          </PixAccordions>
          <PixAccordions>
            <:title>Domaine 2</:title>
            <:content>Contenu domaine 2</:content>
          </PixAccordions>
        </ExpandableAccordions>
      </template>,
    );
  }

  test('it should display both actions and keep accordions collapsed by default', async function (assert) {
    // when
    const screen = await renderTwoAccordions();

    // then
    assert.dom(screen.getByRole('button', { name: 'Tout déplier' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Tout replier' })).exists();
    assert.false(isExpanded(screen, 'Domaine 1'));
    assert.false(isExpanded(screen, 'Domaine 2'));
  });

  test('it should expand every accordion', async function (assert) {
    // given
    const screen = await renderTwoAccordions();

    // when
    await clickByName('Tout déplier');

    // then
    assert.true(isExpanded(screen, 'Domaine 1'));
    assert.true(isExpanded(screen, 'Domaine 2'));
  });

  test('it should collapse every accordion', async function (assert) {
    // given
    const screen = await renderTwoAccordions();
    await clickByName('Tout déplier');

    // when
    await clickByName('Tout replier');

    // then
    assert.false(isExpanded(screen, 'Domaine 1'));
    assert.false(isExpanded(screen, 'Domaine 2'));
  });

  test('it should stay collapsed when collapsing right after expanding', async function (assert) {
    // given
    const screen = await renderTwoAccordions();

    // when
    // Sans annulation de la passe d'ouverture en attente, la frame suivante rouvrirait tout.
    await clickByName('Tout déplier');
    await clickByName('Tout replier');
    await new Promise((resolve) => setTimeout(resolve, 100));

    // then
    assert.false(isExpanded(screen, 'Domaine 1'));
    assert.false(isExpanded(screen, 'Domaine 2'));
  });

  test('it should expand nested accordions that are only rendered once their parent is open', async function (assert) {
    // given
    const screen = await render(
      <template>
        <ExpandableAccordions>
          <PixAccordions>
            <:title>Domaine 1</:title>
            <:content>
              <PixAccordions>
                <:title>Compétence 1</:title>
                <:content>Contenu compétence 1</:content>
              </PixAccordions>
            </:content>
          </PixAccordions>
        </ExpandableAccordions>
      </template>,
    );

    // when
    await clickByName('Tout déplier');

    // then
    // Les accordéons imbriqués ne sont rendus qu'une fois leur parent ouvert : l'ouverture se
    // propage sur plusieurs frames, d'où l'attente explicite.
    await waitUntil(() => screen.queryByRole('button', { name: 'Compétence 1' }));
    await waitUntil(() => isExpanded(screen, 'Compétence 1'));

    assert.true(isExpanded(screen, 'Domaine 1'));
    assert.true(isExpanded(screen, 'Compétence 1'));
    assert.dom(screen.getByText('Contenu compétence 1')).exists();
  });

  test('it should leave an accordion already expanded by the user untouched', async function (assert) {
    // given
    const screen = await renderTwoAccordions();
    await clickByName('Domaine 1');

    // when
    await clickByName('Tout déplier');

    // then
    assert.true(isExpanded(screen, 'Domaine 1'));
    assert.true(isExpanded(screen, 'Domaine 2'));
  });

  test('it should not touch accordions rendered outside of the block', async function (assert) {
    // given
    const screen = await render(
      <template>
        <ExpandableAccordions>
          <PixAccordions>
            <:title>Domaine dans le bloc</:title>
            <:content>Contenu du bloc</:content>
          </PixAccordions>
        </ExpandableAccordions>
        <PixAccordions>
          <:title>Domaine hors du bloc</:title>
          <:content>Contenu hors du bloc</:content>
        </PixAccordions>
      </template>,
    );

    // when
    await clickByName('Tout déplier');

    // then
    assert.true(isExpanded(screen, 'Domaine dans le bloc'));
    assert.false(isExpanded(screen, 'Domaine hors du bloc'));
  });

  test('it should stop clicking after a bounded number of passes', async function (assert) {
    // given
    // Un accordéon dont le clic ne bascule jamais `aria-expanded` : sans garde-fou,
    // la récursion le recliquerait à chaque frame indéfiniment.
    const screen = await render(
      <template>
        <ExpandableAccordions>
          <button type="button" class="pix-accordions__title" aria-expanded="false">Accordéon bloqué</button>
        </ExpandableAccordions>
      </template>,
    );
    const stuck = screen.getByRole('button', { name: 'Accordéon bloqué' });
    let clickCount = 0;
    stuck.addEventListener('click', () => (clickCount += 1));

    // when
    await clickByName('Tout déplier');
    await waitUntil(() => clickCount >= 21, { timeout: 2000 });
    const countWhenBoundReached = clickCount;
    await new Promise((resolve) => setTimeout(resolve, 200));

    // then
    assert.strictEqual(clickCount, countWhenBoundReached, 'la récursion est arrêtée');
    assert.strictEqual(countWhenBoundReached, 21, 'une passe initiale puis MAX_EXPAND_PASSES au maximum');
  });
});
