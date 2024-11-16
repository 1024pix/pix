import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'junior/helpers/tests';
import { module, test } from 'qunit';

module('Integration | Component | Challenge', function (hooks) {
  setupRenderingTest(hooks);

  module('if learner has oralization feature', function () {
    test('should display oralization buttons on instruction bubbles', async function (assert) {
      this.set('challenge', { instruction: ['1ère instruction', '2ème instruction'] });
      const screen = await render(hbs`<template>
  <Challenge @challenge={{this.challenge}} @oralization={{true}} />
</template>`);

      assert.strictEqual(screen.getAllByText(t('components.oralization-button.play')).length, 2);
    });
  });
  module('if learner has not oralization feature', function () {
    test('should not display oralization buttons', async function (assert) {
      const store = this.owner.lookup('service:store');
      this.set('organizationLearner', store.createRecord('organization-learner', { features: [] }));
      this.set('challenge', { instruction: ['1ère instruction', '2ème instruction'] });
      const screen = await render(hbs`<template>
  <Challenge @challenge={{this.challenge}} @oralization={{false}} />
</template>`);

      assert.dom(screen.queryByText(t('components.oralization-button.play'))).doesNotExist();
    });
  });
});
