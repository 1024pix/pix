import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | Congratulations Certification Banner', function () {
  setupIntlRenderingTest();

  it('renders a banner indicating the user certifiability', async function () {
    // given
    this.set('fullName', 'Fifi Brindacier');

    // when
    const screen = await render(hbs`<CongratulationsCertificationBanner @fullName={{this.fullName}}/>`);

    // then
    expect(screen.getByText('Bravo Fifi Brindacier,votre profil est certifiable.')).to.exist;
  });

  it('calls the closeBanner method when closing the banner', async function () {
    // given
    const closeBannerStub = sinon.stub();
    this.set('closeBanner', closeBannerStub);
    this.set('fullName', 'Fifi Brindacier');
    const screen = await render(
      hbs`<CongratulationsCertificationBanner @fullName={{this.fullName}} @closeBanner={{this.closeBanner}}/>`
    );

    // when
    await click(screen.getByLabelText('Fermer'));

    // then
    sinon.assert.calledOnce(closeBannerStub);
  });

  describe('When there are eligible complementary certifications', function () {
    it(`renders complementary certification eligibility messages and pictures`, async function () {
      // given
      const store = this.owner.lookup('service:store');
      const certificationEligibility = store.createRecord('is-certifiable', {
        eligibleComplementaryCertifications: [
          { label: 'CléA Numérique', imageUrl: 'http://www.image-clea.com' },
          { label: 'Pix+ Édu 1er degré Confirmé', imageUrl: 'http://www.image-clea.com' },
        ],
      });
      this.set('certificationEligibility', certificationEligibility);
      this.set('fullName', 'Fifi Brindacier');

      // when
      const screen = await render(
        hbs`<CongratulationsCertificationBanner @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}}/>`
      );

      // then
      expect(screen.getByText('Vous êtes également éligible à la certification CléA Numérique.')).to.exist;
      expect(screen.getByText('Vous êtes également éligible à la certification Pix+ Édu 1er degré Confirmé.')).to.exist;
      expect(screen.getByRole('img', { name: 'CléA Numérique' })).to.exist;
      expect(screen.getByRole('img', { name: 'Pix+ Édu 1er degré Confirmé' })).to.exist;
    });
  });
});
