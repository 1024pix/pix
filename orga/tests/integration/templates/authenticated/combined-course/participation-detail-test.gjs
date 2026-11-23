import { render } from '@1024pix/ember-testing-library';
import ParticipationDetail from 'pix-orga/templates/authenticated/combined-course/participation-detail';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Template | authenticated/combined-course/participation-detail', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it renders template', async function (assert) {
    // given
    const model = {
      combinedCourse: {
        id: 123,
        name: 'Combinix',
      },
      participation: {
        firstName: 'Jean',
        lastName: 'Bon',
      },
    };

    // when
    const screen = await render(<template><ParticipationDetail @model={{model}} /></template>);

    // then
    assert.ok(screen.getByRole('heading', { name: 'Jean Bon', level: 1 }));
    assert.ok(screen.getByRole('link', { name: t('navigation.main.campaigns') }));
    assert.ok(screen.getByRole('link', { name: t('navigation.main.combined-courses') }));
    assert.ok(screen.getByRole('link', { name: 'Combinix' }));
    assert.ok(screen.getByText('Participation de Jean Bon'));
  });
});
