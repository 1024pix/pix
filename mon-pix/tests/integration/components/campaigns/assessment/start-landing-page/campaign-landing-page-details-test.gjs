import { render } from '@1024pix/ember-testing-library';
import CampaignLandingPageDetails from 'mon-pix/components/campaign-landing-page-details';
import { t } from 'mon-pix/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module(
  'Integration | Components | Campaigns | Assessment | Start Landing Page | Campaign Landing Page Details',
  function (hooks) {
    setupIntlRenderingTest(hooks);

    test('it should display the three steps', async function (assert) {
      // given
      const expectedTitles = [
        t('components.campaigns.start-landing-page.steps.step1.title'),
        t('components.campaigns.start-landing-page.steps.step2.title'),
        t('components.campaigns.start-landing-page.steps.step3.title'),
      ];

      const expectedDescriptions = [
        t('components.campaigns.start-landing-page.steps.step1.description'),
        t('components.campaigns.start-landing-page.steps.step2.description'),
        t('components.campaigns.start-landing-page.steps.step3.description'),
      ];

      const expectedImagesSrc = ['/images/rocket.svg', '/images/chart.svg', '/images/book.svg'];

      // when
      const screen = await render(<template><CampaignLandingPageDetails /></template>);

      // then
      const stepTitles = screen.getAllByRole('heading', { level: 3 }).map((el) => el.textContent);
      const stepDescriptions = screen.getAllByRole('paragraph').map((el) => el.textContent);
      const stepImages = screen.getAllByRole('presentation');

      assert.deepEqual(stepTitles, expectedTitles);
      assert.deepEqual(stepDescriptions, expectedDescriptions);
      stepImages.forEach((stepImage, index) => {
        assert.dom(stepImage).hasAttribute('src', expectedImagesSrc[index]);
      });
    });
  },
);
