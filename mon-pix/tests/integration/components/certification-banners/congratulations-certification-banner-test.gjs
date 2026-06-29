import { render } from '@1024pix/ember-testing-library';
import CongratulationsCertificationBanner from 'mon-pix/components/certification-banners/congratulations-certification-banner';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Certification Banners | Congratulations Certification Banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders a banner indicating the user certifiability', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const fullName = 'Fifi Brindacier';
    const certificationEligibility = store.createRecord('is-certifiable', {});

    // when
    const screen = await render(
      <template>
        <CongratulationsCertificationBanner
          @fullName={{fullName}}
          @certificationEligibility={{certificationEligibility}}
        />
      </template>,
    );

    // then
    assert.ok(screen.getByText('Bravo Fifi Brindacier, votre profil Pix est certifiable.'));
  });

  module('when there is no double certification eligibility', function () {
    test('should not display double certification information', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const fullName = 'Fifi Brindacier';
      const certificationEligibility = store.createRecord('is-certifiable', { 'is-certifiable': true });

      // when
      const screen = await render(
        <template>
          <CongratulationsCertificationBanner
            @fullName={{fullName}}
            @certificationEligibility={{certificationEligibility}}
          />
        </template>,
      );

      // then
      assert.notOk(screen.queryByText('Vous êtes également éligible à la certification complémentaire :'));
    });
  });
});
