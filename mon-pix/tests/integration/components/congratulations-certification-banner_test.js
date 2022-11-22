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
    const store = this.owner.lookup('service:store');
    this.set('fullName', 'Fifi Brindacier');
    this.set('closeBanner', () => {});
    this.set('certificationEligibility', store.createRecord('is-certifiable', {}));

    // when
    const screen = await render(
      hbs`<CongratulationsCertificationBanner @fullName={{this.fullName}} @closeBanner={{this.closeBanner}} @certificationEligibility={{this.certificationEligibility}}/>`
    );

    // then
    expect(screen.getByText('Bravo Fifi Brindacier, votre profil Pix est certifiable.')).to.exist;
  });

  it('calls the closeBanner method when closing the banner', async function () {
    // given
    const store = this.owner.lookup('service:store');
    const closeBannerStub = sinon.stub();
    this.set('closeBanner', closeBannerStub);
    this.set('fullName', 'Fifi Brindacier');
    this.set('certificationEligibility', store.createRecord('is-certifiable', {}));

    const screen = await render(
      hbs`<CongratulationsCertificationBanner @fullName={{this.fullName}} @closeBanner={{this.closeBanner}} @certificationEligibility={{this.certificationEligibility}}/>`
    );

    // when
    await click(screen.getByLabelText('Fermer'));

    // then
    sinon.assert.calledOnce(closeBannerStub);
  });

  describe('When there are eligible complementary certifications', function () {
    describe('When there is only one eligible complementary certification', function () {
      it(`renders the complementary certification eligibility special message and picture`, async function () {
        // given
        const store = this.owner.lookup('service:store');
        const certificationEligibility = store.createRecord('is-certifiable', {
          eligibleComplementaryCertifications: [{ label: 'CléA Numérique', imageUrl: 'http://www.image-clea.com' }],
        });
        this.set('certificationEligibility', certificationEligibility);
        this.set('fullName', 'Fifi Brindacier');
        this.set('closeBanner', () => {});

        // when
        const screen = await render(
          hbs`<CongratulationsCertificationBanner @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}} @closeBanner={{this.closeBanner}}/>`
        );

        // then
        expect(screen.getByText('Vous êtes également éligible à la certification complémentaire :')).to.exist;
        expect(screen.getByText('CléA Numérique')).to.exist;
        expect(screen.getByRole('img', { name: 'CléA Numérique' })).to.exist;
      });
    });

    describe('When there are multiple eligible complementary certifications', function () {
      it(`renders the multiple complementary certification eligibility pluralized message and pictures`, async function () {
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
        this.set('closeBanner', () => {});

        // when
        const screen = await render(
          hbs`<CongratulationsCertificationBanner @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}} @closeBanner={{this.closeBanner}}/>`
        );

        // then
        expect(screen.getByText('Vous êtes également éligible aux certifications complémentaires :')).to.exist;
        expect(screen.getByText('CléA Numérique')).to.exist;
        expect(screen.getByText('Pix+ Édu 1er degré Confirmé')).to.exist;
        expect(screen.getByRole('img', { name: 'CléA Numérique' })).to.exist;
        expect(screen.getByRole('img', { name: 'Pix+ Édu 1er degré Confirmé' })).to.exist;
      });
    });
  });
});
