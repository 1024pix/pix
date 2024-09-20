import { visit } from '@1024pix/ember-testing-library';
import { module, test } from 'qunit';

import { setupApplicationTest } from '../../tests/helpers';

module('Acceptance | School | divisions', function (hooks) {
  setupApplicationTest(hooks);
  hooks.afterEach(async function () {
    localStorage.clear();
  });

  test('should display all existant divisions', async function (assert) {
    // given
    const longClassName = 'CM2-B 3 3 3 3 adzaz azd adazdzad dzad d';
    this.server.create('school', {
      organizationLearners: [
        {
          id: 1,
          division: longClassName,
          firstName: 'Sara',
          displayName: 'Sara A.',
          organizationId: 9000,
        },
        { id: 2, division: 'CM2 A', firstName: 'Mickey', displayName: 'Mickey', organizationId: 9000 },
      ],
    });
    // when
    const screen = await visit('/schools/MINIPIXOU');
    const htmlElementsWithLongName = screen.queryAllByText(longClassName);

    assert.strictEqual(htmlElementsWithLongName.length, 2);
  });
});
