import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | Certification Banner', function() {

  setupIntlRenderingTest();

  context('On component rendering', function() {
    const firstName = 'tom';
    const lastName = 'jedusor';
    const fullName = 'Tom JEDUSOR';
    const certificationNumber = 100;

    beforeEach(function() {
      // given
      const certification = EmberObject.create({
        id: certificationNumber,
        firstName,
        lastName,
      });
      this.set('certificationNumber', certificationNumber);
      this.set('certification', certification);
    });

    it('should render component with user fullName', async function() {
      // when
      await render(hbs`<CertificationBanner @certification={{this.certification}} />`);

      // then
      expect(find('.assessment-banner__title').textContent.trim()).to.equal(fullName);
    });

    it('should render component with certificationNumber', async function() {
      // when
      await render(hbs`<CertificationBanner @certificationNumber={{this.certificationNumber}} />`);

      // then
      expect(find('.certification-number__value').textContent.trim()).to.equal(`${certificationNumber}`);
    });
  });
});
