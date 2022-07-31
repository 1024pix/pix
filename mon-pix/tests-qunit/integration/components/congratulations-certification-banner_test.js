import { module, test } from 'qunit';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, find, render } from '@ember/test-helpers';
import { contains } from '../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Congratulations Certification Banner', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders a banner indicating the user certifiability', async function (assert) {
    // given
    this.set('fullName', 'Fifi Brindacier');

    // when
    await render(hbs`<CongratulationsCertificationBanner @fullName={{this.fullName}}/>`);

    // then
    assert
      .dom(find('.congratulations-banner__message').textContent)
      .hasText('Bravo Fifi Brindacier,votre profil est certifiable.');
  });

  test('calls the closeBanner method when closing the banner', async function (assert) {
    // given
    const closeBannerStub = sinon.stub();
    this.set('closeBanner', closeBannerStub);
    this.set('fullName', 'Fifi Brindacier');
    await render(
      hbs`<CongratulationsCertificationBanner @fullName={{this.fullName}} @closeBanner={{this.closeBanner}}/>`
    );

    // when
    await click('[aria-label="Fermer"]');

    // then
    assert.expect(0);
    sinon.assert.calledOnce(closeBannerStub);
  });

  module('When there are eligible complementary certifications', function () {
    test('renders complementary certification eligibility message', async function () {
      // given
      const store = this.owner.lookup('service:store');
      const certificationEligibility = store.createRecord('is-certifiable', {
        eligibleComplementaryCertifications: ['CléA Numérique', 'Pix+ Édu 1er degré Confirmé'],
      });
      this.set('certificationEligibility', certificationEligibility);
      this.set('fullName', 'Fifi Brindacier');

      // when
      await render(
        hbs`<CongratulationsCertificationBanner @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}}/>`
      );

      // then
      assert.dom(contains('Vous êtes également éligible à la certification CléA Numérique.')).exists();
      assert.dom(contains('Vous êtes également éligible à la certification Pix+ Édu 1er degré Confirmé.')).exists();
    });
  });
});
