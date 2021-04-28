import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | stage-stars', function(hooks) {
  setupIntlRenderingTest(hooks);

  test('should render stars for given stages', async function(assert) {
    // given
    this.set('result', 50);
    this.set('stages', [{ threshold: 20 }, { threshold: 70 }]);

    // when
    await render(hbs`<StageStars @result={{this.result}} @stages={{this.stages}} />`);

    const acquiredStars = this.element.querySelectorAll('.pix-stars__acquired');
    const unacquiredStars = this.element.querySelectorAll('.pix-stars__unacquired');

    // then
    assert.equal(acquiredStars.length, 1);
    assert.equal(unacquiredStars.length, 1);
  });

  test('should render a star only when threshold > 0 and reached', async function(assert) {
    // given
    this.set('result', 50);
    this.set('stages', [{ threshold: 0 }, { threshold: 20 }, { threshold: 70 }]);

    // when
    await render(hbs`<StageStars @result={{this.result}} @stages={{this.stages}} />`);

    const acquiredStars = this.element.querySelectorAll('.pix-stars__acquired');
    const unacquiredStars = this.element.querySelectorAll('.pix-stars__unacquired');

    // then
    assert.equal(acquiredStars.length, 1);
    assert.equal(unacquiredStars.length, 1);
  });

  test('should render a screen reader message', async function(assert) {
    // given
    this.set('result', 50);
    this.set('stages', [{ threshold: 20 }, { threshold: 70 }]);

    // when
    await render(hbs`<StageStars @result={{this.result}} @stages={{this.stages}} />`);

    const srOnly = this.element.querySelector('.sr-only');

    // then
    assert.equal(srOnly.textContent.trim(), '1 étoiles sur 2');
  });

  test('should not display tooltip by default', async function(assert) {
    // given
    this.set('result', 50);
    this.set('stages', [{ threshold: 20 }, { threshold: 70 }]);

    // when
    await render(hbs`<StageStars @result={{this.result}} @stages={{this.stages}}/>`);

    // then
    assert.dom('[role="tooltip"]').doesNotExist();
  });

  test('should not display tooltip when no stage has been reached yet', async function(assert) {
    // given
    this.set('result', undefined);
    this.set('stages', [{ threshold: 20 }, { threshold: 70 }]);

    // when
    await render(hbs`<StageStars @result={{this.result}} @stages={{this.stages}}/>`);

    // then
    assert.dom('[role="tooltip"]').doesNotExist();
  });

  test('should render tooltip with reached stage prescriber title', async function(assert) {
    // given
    this.set('result', 50);
    this.set('stages', [{ threshold: 20, prescriberTitle: 'title' }, { threshold: 70 }]);

    // when
    await render(hbs`<StageStars @result={{this.result}} @stages={{this.stages}} @withTooltip={{true}}/>`);

    // then
    assert.dom('[role="tooltip"]').hasText('title');
  });

  test('should render tooltip with reached stage prescriber description', async function(assert) {
    // given
    this.set('result', 50);
    this.set('stages', [{ threshold: 20, prescriberDescription: 'description' }, { threshold: 70 }]);

    // when
    await render(hbs`<StageStars @result={{this.result}} @stages={{this.stages}} @withTooltip={{true}}/>`);

    // then
    assert.dom('[role="tooltip"]').hasText('description');
  });

  test('should render tooltip with reached stage prescriber title and description', async function(assert) {
    // given
    this.set('result', 50);
    this.set('stages', [{ threshold: 20, prescriberTitle: 'title', prescriberDescription: 'description' }, { threshold: 70 }]);

    // when
    await render(hbs`<StageStars @result={{this.result}} @stages={{this.stages}} @withTooltip={{true}}/>`);

    // then
    assert.dom('[role="tooltip"]').hasText('titledescription');
  });

  test('should not display tooltip when reached stage has no prescriber title nor description', async function(assert) {
    // given
    this.set('result', 50);
    this.set('stages', [{ threshold: 20 }, { threshold: 70 }]);

    // when
    await render(hbs`<StageStars @result={{this.result}} @stages={{this.stages}} @withTooltip={{true}}/>`);

    // then
    assert.dom('[role="tooltip"]').doesNotExist();
  });
});
