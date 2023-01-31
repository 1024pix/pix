import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Campaign::StageStars', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should render stars for given stages', async function (assert) {
    // given
    this.result = 50;
    this.stages = [{ threshold: 20 }, { threshold: 70 }];

    // when
    await render(hbs`<Campaign::StageStars @result={{this.result}} @stages={{this.stages}} />`);

    const acquiredStars = this.element.querySelectorAll('.pix-stars__acquired');
    const unacquiredStars = this.element.querySelectorAll('.pix-stars__unacquired');

    // then
    assert.strictEqual(acquiredStars.length, 1);
    assert.strictEqual(unacquiredStars.length, 1);
  });

  test('should render a star only when threshold > 0 and reached', async function (assert) {
    // given
    this.result = 50;
    this.stages = [{ threshold: 0 }, { threshold: 20 }, { threshold: 70 }];

    // when
    await render(hbs`<Campaign::StageStars @result={{this.result}} @stages={{this.stages}} />`);

    const acquiredStars = this.element.querySelectorAll('.pix-stars__acquired');
    const unacquiredStars = this.element.querySelectorAll('.pix-stars__unacquired');

    // then
    assert.strictEqual(acquiredStars.length, 1);
    assert.strictEqual(unacquiredStars.length, 1);
  });

  test('should render a screen reader message', async function (assert) {
    // given
    this.result = 50;
    this.stages = [{ threshold: 20 }, { threshold: 70 }];

    // when
    const screen = await render(hbs`<Campaign::StageStars @result={{this.result}} @stages={{this.stages}} />`);

    // then
    assert.dom(screen.getByLabelText('1 étoiles sur 2')).exists();
  });

  test('should not display tooltip by default', async function (assert) {
    // given
    this.result = 50;
    this.stages = [{ threshold: 20 }, { threshold: 70 }];

    // when
    await render(hbs`<Campaign::StageStars @result={{this.result}} @stages={{this.stages}} />`);

    // then
    assert.dom('[role="tooltip"]').doesNotExist();
  });

  test('should not display tooltip when no stage has been reached yet', async function (assert) {
    // given
    this.result = undefined;
    this.stages = [{ threshold: 20 }, { threshold: 70 }];

    // when
    await render(hbs`<Campaign::StageStars @result={{this.result}} @stages={{this.stages}} />`);

    // then
    assert.dom('[role="tooltip"]').doesNotExist();
  });

  test('should render tooltip with reached stage prescriber title', async function (assert) {
    // given
    this.result = 50;
    this.stages = [{ threshold: 20, prescriberTitle: 'title' }, { threshold: 70 }];

    // when
    await render(hbs`<Campaign::StageStars @result={{this.result}} @stages={{this.stages}} @withTooltip={{true}} />`);

    // then
    assert.dom('[role="tooltip"]').hasText('title');
  });

  test('should render tooltip with reached stage prescriber description', async function (assert) {
    // given
    this.result = 50;
    this.stages = [{ threshold: 20, prescriberDescription: 'description' }, { threshold: 70 }];

    // when
    await render(hbs`<Campaign::StageStars @result={{this.result}} @stages={{this.stages}} @withTooltip={{true}} />`);

    // then
    assert.dom('[role="tooltip"]').hasText('description');
  });

  test('should render tooltip with reached stage prescriber title and description', async function (assert) {
    // given
    this.result = 50;
    this.stages = [
      { threshold: 20, prescriberTitle: 'title', prescriberDescription: 'description' },
      { threshold: 70 },
    ];

    // when
    await render(hbs`<Campaign::StageStars @result={{this.result}} @stages={{this.stages}} @withTooltip={{true}} />`);

    // then
    assert.dom('[role="tooltip"]').hasText('titledescription');
  });

  test('should not display tooltip when reached stage has no prescriber title nor description', async function (assert) {
    // given
    this.result = 50;
    this.stages = [{ threshold: 20 }, { threshold: 70 }];

    // when
    await render(hbs`<Campaign::StageStars @result={{this.result}} @stages={{this.stages}} @withTooltip={{true}} />`);

    // then
    assert.dom('[role="tooltip"]').doesNotExist();
  });
});
