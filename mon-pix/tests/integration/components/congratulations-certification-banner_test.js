import { run } from '@ember/runloop';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | Congratulations Certification Banner', function() {
  setupIntlRenderingTest();

  it('renders a banner indicating the user certifiability', async function() {
    // given
    this.set('fullName', 'Fifi Brindacier');

    // when
    await render(hbs`<CongratulationsCertificationBanner @fullName={{this.fullName}}/>`);

    // then
    expect(find('.congratulations-banner__message').textContent).to.contains('Bravo Fifi Brindacier,votre profil est certifiable.');
  });

  it('calls the closeBanner method when closing the banner', async function() {
    // given
    const closeBannerStub = sinon.stub();
    this.set('closeBanner', closeBannerStub);
    this.set('fullName', 'Fifi Brindacier');
    await render(hbs`<CongratulationsCertificationBanner @fullName={{this.fullName}} @closeBanner={{this.closeBanner}}/>`);

    // when
    await click('[aria-label="Fermer"]');

    // then
    sinon.assert.calledOnce(closeBannerStub);
  });

  it('renders specific Clea text when eligible Clea certification', async function() {
    // given
    const store = this.owner.lookup('service:store');
    const certificationEligibility = run(() => store.createRecord('is-certifiable', {
      cleaCertificationEligible: true,
    }));
    this.set('certificationEligibility', certificationEligibility);
    this.set('fullName', 'Fifi Brindacier');

    // when
    await render(hbs`<CongratulationsCertificationBanner @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}}/>`);

    // then
    expect(find('[data-test-eligible-clea]').textContent).to.contains('Vous êtes également éligible à la certification CléA numérique.');
  });

  it('renders specific Pix+ Droit Maitre text when eligible Pix+ Droit maitre certification', async function() {
    // given
    const store = this.owner.lookup('service:store');
    const certificationEligibility = run(() => store.createRecord('is-certifiable', {
      pixPlusDroitMaitreCertificationEligible: true,
    }));
    this.set('certificationEligibility', certificationEligibility);
    this.set('fullName', 'Fifi Brindacier');

    // when
    await render(hbs`<CongratulationsCertificationBanner @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}}/>`);

    // then
    expect(find('[data-test-eligible-pix-plus-droit-maitre]').textContent).to.contains('Vous êtes également éligible à la certification Pix+ Droit Maître.');
  });

  it('renders specific Pix+ Droit Expert text when eligible Pix+ Droit expert certification', async function() {
    // given
    const store = this.owner.lookup('service:store');
    const certificationEligibility = run(() => store.createRecord('is-certifiable', {
      pixPlusDroitExpertCertificationEligible: true,
    }));
    this.set('certificationEligibility', certificationEligibility);
    this.set('fullName', 'Fifi Brindacier');

    // when
    await render(hbs`<CongratulationsCertificationBanner @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}}/>`);

    // then
    expect(find('[data-test-eligible-pix-plus-droit-expert]').textContent).to.contains('Vous êtes également éligible à la certification Pix+ Droit Expert.');
  });
});
