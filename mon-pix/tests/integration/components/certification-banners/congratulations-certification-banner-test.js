import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Certification Banners | Congratulations Certification Banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders a banner indicating the user certifiability', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    this.set('fullName', 'Fifi Brindacier');
    this.set('closeBanner', () => {});
    this.set('certificationEligibility', store.createRecord('is-certifiable', {}));

    // when
    const screen = await render(
      hbs`<CertificationBanners::CongratulationsCertificationBanner
  @fullName={{this.fullName}}
  @closeBanner={{this.closeBanner}}
  @certificationEligibility={{this.certificationEligibility}}
/>`,
    );

    // then
    assert.ok(screen.getByText('Bravo Fifi Brindacier, votre profil Pix est certifiable.'));
  });

  test('calls the closeBanner method when closing the banner', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const closeBannerStub = sinon.stub();
    this.set('closeBanner', closeBannerStub);
    this.set('fullName', 'Fifi Brindacier');
    this.set('certificationEligibility', store.createRecord('is-certifiable', {}));

    const screen = await render(
      hbs`<CertificationBanners::CongratulationsCertificationBanner
  @fullName={{this.fullName}}
  @closeBanner={{this.closeBanner}}
  @certificationEligibility={{this.certificationEligibility}}
/>`,
    );

    // when
    await click(screen.getByLabelText('Fermer'));

    // then
    sinon.assert.calledOnce(closeBannerStub);
    assert.ok(true);
  });
});
