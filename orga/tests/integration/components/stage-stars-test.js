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
});
