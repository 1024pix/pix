import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { click, find, render } from '@ember/test-helpers';
import { contains } from '../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | Congratulations Certification Banner', function () {
  setupIntlRenderingTest();

  it('renders a banner indicating the user certifiability', async function () {
    // given
    this.set('fullName', 'Fifi Brindacier');

    // when
    await render(hbs`<CongratulationsCertificationBanner @fullName={{this.fullName}}/>`);

    // then
    expect(find('.congratulations-banner__message').textContent).to.contains(
      'Bravo Fifi Brindacier,votre profil est certifiable.'
    );
  });

  it('calls the closeBanner method when closing the banner', async function () {
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
    sinon.assert.calledOnce(closeBannerStub);
  });

  [
    {
      record: { cleaCertificationEligible: true },
      expectedMessage: 'Vous êtes également éligible à la certification CléA numérique.',
    },
    {
      record: { pixPlusDroitMaitreCertificationEligible: true },
      expectedMessage: 'Vous êtes également éligible à la certification Pix+ Droit Maître.',
    },
    {
      record: { pixPlusDroitExpertCertificationEligible: true },
      expectedMessage: 'Vous êtes également éligible à la certification Pix+ Droit Expert.',
    },
    {
      record: { pixPlusEduInitieCertificationEligible: true },
      expectedMessage: 'Vous êtes également éligible à la certification Pix+ Édu Initié (entrée dans le métier).',
    },
    {
      record: { pixPlusEduConfirmeCertificationEligible: true },
      expectedMessage: 'Vous êtes également éligible à la certification Pix+ Édu Confirmé.',
    },
    {
      record: { pixPlusEduAvanceCertificationEligible: true },
      expectedMessage: 'Vous êtes également éligible à la certification Pix+ Édu Avancé.',
    },
    {
      record: { pixPlusEduExpertCertificationEligible: true },
      expectedMessage: 'Vous êtes également éligible à la certification Pix+ Édu Expert.',
    },
  ].forEach(({ record, expectedMessage }) => {
    it(`renders "${expectedMessage}" when ${Object.keys(record)[0]} is ${Object.values(record)[0]}`, async function () {
      // given
      const store = this.owner.lookup('service:store');
      const certificationEligibility = store.createRecord('is-certifiable', record);
      this.set('certificationEligibility', certificationEligibility);
      this.set('fullName', 'Fifi Brindacier');

      // when
      await render(
        hbs`<CongratulationsCertificationBanner @certificationEligibility={{this.certificationEligibility}} @fullName={{this.fullName}}/>`
      );

      // then
      expect(contains(expectedMessage)).to.exist;
    });
  });
});
