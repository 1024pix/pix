import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaigns/details/collective-results/success-indicator', function(hooks) {
  setupRenderingTest(hooks);

  test('should display value', async function(assert) {
    // given
    this.set('value', 50);

    // when
    await render(hbs`
      <Routes::Authenticated::Campaign::CollectiveResults::SuccessIndicator @value={{this.value}} />`);

    // then
    const component = getSuccessIndicator(this);
    assert.equal(component.innerText.includes('50%'), true);
  });

  test('should add class red if value is under 33', async function(assert) {
    // given
    this.set('value', 20);

    // when
    await render(hbs`
      <Routes::Authenticated::Campaign::CollectiveResults::SuccessIndicator @value={{this.value}} />`);

    // then
    const component = getSuccessIndicator(this);
    const isRed = hasClassContaining(component, 'red');
    assert.equal(isRed, true);
  });

  test('should add class orange if value is under 66', async function(assert) {
    // given
    this.set('value', 55);

    // when
    await render(hbs`
      <Routes::Authenticated::Campaign::CollectiveResults::SuccessIndicator @value={{this.value}} />`);

    // then
    const component = getSuccessIndicator(this);
    const isOrange = hasClassContaining(component, 'orange');
    assert.equal(isOrange, true);
  });

  test('should add class green if value is upper 66', async function(assert) {
    // given
    this.set('value', 70);

    // when
    await render(hbs`
      <Routes::Authenticated::Campaign::CollectiveResults::SuccessIndicator @value={{this.value}} />`);

    // then
    const component = getSuccessIndicator(this);
    const isGreen = hasClassContaining(component, 'green');
    assert.equal(isGreen, true);
  });
});

function getSuccessIndicator(testInstance) {
  return testInstance.element.querySelector('[aria-label="Indicateur de réussite"]');
}

function hasClassContaining(component, value) {
  return [ ...component.classList ].some((className) => className.includes(value));
}
