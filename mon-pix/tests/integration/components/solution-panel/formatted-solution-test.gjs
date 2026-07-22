import { render } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import FormattedSolution from 'mon-pix/components/solution-panel/formatted-solution';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | formatted-solution.js', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display the provided solution', async function (assert) {
    // Given
    const solutionToDisplay = 'patate';

    // When
    await render(<template><FormattedSolution class="solution" @solutionToDisplay={{solutionToDisplay}} /></template>);

    // Then
    assert.dom('.solution').hasText(solutionToDisplay);
  });

  module('when solution has a new line', function () {
    test('should display the new line', async function (assert) {
      // Given
      const solutionToDisplay = 'patate\nau\nfromage';

      // When
      await render(
        <template><FormattedSolution class="solution" @solutionToDisplay={{solutionToDisplay}} /></template>,
      );

      // Then
      const solution = find('.solution');
      assert.dom(solution).hasText(solutionToDisplay);
      assert.dom(solution).containsHtml('<br>');
    });
  });
});
