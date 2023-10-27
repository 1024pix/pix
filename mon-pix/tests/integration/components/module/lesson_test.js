import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { findAll } from '@ember/test-helpers';

module('Integration | Component | Module | Lesson', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a Lesson', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const lessonElement = store.createRecord('lesson', { content: 'toto', type: 'lessons' });

    this.set('lesson', lessonElement);

    //  when
    const screen = await render(hbs`<Module::Lesson @lesson={{this.lesson}}/>`);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-lesson').length, 1);
    assert.ok(screen.getByText('toto'));
  });
});
