import { clickByName, render } from '@1024pix/ember-testing-library';
import ExpandableAccordion from 'pix-admin/components/common/expandable-accordion';
import ExpandableAccordions from 'pix-admin/components/common/expandable-accordions';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

const DOMAINE = 'Domaine 1';
const AUTRE_DOMAINE = 'Domaine 2';
const COMPETENCE = 'Compétence 1.1';
const SUJETS = 'Sujets de la compétence 1.1';

async function renderNestedAccordions() {
  return render(
    <template>
      <ExpandableAccordions>
        <:default as |expansion|>
          <ExpandableAccordion @expansion={{expansion}}>
            <:title>{{DOMAINE}}</:title>
            <:content>
              <ExpandableAccordion @expansion={{expansion}}>
                <:title>{{COMPETENCE}}</:title>
                <:content><p>{{SUJETS}}</p></:content>
              </ExpandableAccordion>
            </:content>
          </ExpandableAccordion>

          <ExpandableAccordion @expansion={{expansion}}>
            <:title>{{AUTRE_DOMAINE}}</:title>
            <:content><p>Contenu du domaine 2</p></:content>
          </ExpandableAccordion>
        </:default>
      </ExpandableAccordions>
    </template>,
  );
}

function isExpanded(screen, name) {
  return screen.getByRole('button', { name, hidden: true }).getAttribute('aria-expanded') === 'true';
}

module('Integration | Component | Common::ExpandableAccordions', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display the expand and collapse buttons', async function (assert) {
    // when
    const screen = await renderNestedAccordions();

    // then
    assert.dom(screen.getByRole('button', { name: 'Tout déplier' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Tout replier' })).exists();
  });

  test('it should render every accordion collapsed by default', async function (assert) {
    // when
    const screen = await renderNestedAccordions();

    // then
    assert.false(isExpanded(screen, DOMAINE));
    assert.false(isExpanded(screen, AUTRE_DOMAINE));
    assert.dom(screen.queryByText(SUJETS)).doesNotExist();
  });

  test('it should expand every accordion, nested ones included, on expand all', async function (assert) {
    // given
    const screen = await renderNestedAccordions();

    // when
    await clickByName('Tout déplier');

    // then
    assert.true(isExpanded(screen, DOMAINE));
    assert.true(isExpanded(screen, AUTRE_DOMAINE));
    assert.true(isExpanded(screen, COMPETENCE));
    assert.dom(screen.getByText(SUJETS)).isVisible();
  });

  test('it should collapse every accordion on collapse all', async function (assert) {
    // given
    const screen = await renderNestedAccordions();
    await clickByName('Tout déplier');

    // when
    await clickByName('Tout replier');

    // then
    assert.false(isExpanded(screen, DOMAINE));
    assert.false(isExpanded(screen, AUTRE_DOMAINE));
    assert.dom(screen.queryByText(SUJETS)).isNotVisible();
  });

  test('it should only toggle the clicked accordion', async function (assert) {
    // given
    const screen = await renderNestedAccordions();

    // when
    await clickByName(DOMAINE);

    // then
    assert.true(isExpanded(screen, DOMAINE));
    assert.false(isExpanded(screen, AUTRE_DOMAINE));
  });

  test('it should expand everything again after a manual collapse', async function (assert) {
    // given
    const screen = await renderNestedAccordions();
    await clickByName('Tout déplier');
    await clickByName(DOMAINE);
    assert.false(isExpanded(screen, DOMAINE));

    // when
    await clickByName('Tout déplier');

    // then
    assert.true(isExpanded(screen, DOMAINE));
    assert.true(isExpanded(screen, AUTRE_DOMAINE));
    assert.true(isExpanded(screen, COMPETENCE));
  });

  test('it should collapse everything after a manual collapse', async function (assert) {
    // given
    const screen = await renderNestedAccordions();
    await clickByName('Tout déplier');
    await clickByName(DOMAINE);

    // when
    await clickByName('Tout replier');

    // then
    assert.false(isExpanded(screen, DOMAINE));
    assert.false(isExpanded(screen, AUTRE_DOMAINE));
    assert.false(isExpanded(screen, COMPETENCE));
  });

  module('when the toolbar is hidden', function () {
    test('it should not display the buttons but keep the accordions usable', async function (assert) {
      // given
      const screen = await render(
        <template>
          <ExpandableAccordions @displayToolbar={{false}}>
            <:default as |expansion|>
              <ExpandableAccordion @expansion={{expansion}}>
                <:title>{{DOMAINE}}</:title>
                <:content><p>{{SUJETS}}</p></:content>
              </ExpandableAccordion>
            </:default>
          </ExpandableAccordions>
        </template>,
      );

      // then
      assert.dom(screen.queryByRole('button', { name: 'Tout déplier' })).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: 'Tout replier' })).doesNotExist();

      // when
      await clickByName(DOMAINE);

      // then
      assert.true(isExpanded(screen, DOMAINE));
      assert.dom(screen.getByText(SUJETS)).isVisible();
    });
  });

  module('when used without an expansion', function () {
    test('it should let the accordion handle its own state', async function (assert) {
      // given
      const screen = await render(
        <template>
          <ExpandableAccordion>
            <:title>{{DOMAINE}}</:title>
            <:content><p>{{SUJETS}}</p></:content>
          </ExpandableAccordion>
        </template>,
      );
      assert.dom(screen.queryByText(SUJETS)).doesNotExist();

      // when
      await clickByName(DOMAINE);

      // then
      assert.true(isExpanded(screen, DOMAINE));
      assert.dom(screen.getByText(SUJETS)).isVisible();

      // when
      await clickByName(DOMAINE);

      // then
      assert.false(isExpanded(screen, DOMAINE));
      assert.dom(screen.getByText(SUJETS)).isNotVisible();
    });
  });
});
