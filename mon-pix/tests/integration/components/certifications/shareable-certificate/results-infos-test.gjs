import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ResultsInfos from 'mon-pix/components/certifications/shareable-certificate/results-infos';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Certifications | Shareable certificate | results-infos', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays the results title with the given tag, the summary and the description', async function (assert) {
    // given
    const tagContent = 'Expert 1';
    const description = 'Description du niveau';

    // when
    const screen = await render(
      <template>
        <ResultsInfos @summary="Résumé du niveau">
          <:tag><span>{{tagContent}}</span></:tag>
          <:description><p>{{description}}</p></:description>
        </ResultsInfos>
      </template>,
    );

    // then
    assert
      .dom(screen.getByRole('heading', { level: 3, name: `${t('pages.certificate.results.title')} ${tagContent}` }))
      .exists();
    assert.dom(screen.getByText('Résumé du niveau')).exists();
    assert.dom(screen.getByText(description)).exists();
  });

  test('it displays the results title alone when no tag is given', async function (assert) {
    // given
    const description = 'Description du niveau';

    // when
    const screen = await render(
      <template>
        <ResultsInfos @summary="Résumé du niveau">
          <:description><p>{{description}}</p></:description>
        </ResultsInfos>
      </template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { level: 3, name: t('pages.certificate.results.title') })).exists();
  });
});
