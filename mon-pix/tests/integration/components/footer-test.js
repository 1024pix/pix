import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { contains } from '../../helpers/contains';

describe('Integration | Component | Footer', function() {

  setupIntlRenderingTest();

  it('should display the Pix logo', async function() {
    // when
    await render(hbs`<Footer />}`);

    // then
    expect(find('.pix-logo__image')).to.exist;
  });

  it('should display the navigation menu with expected elements', async function() {
    // when
    await render(hbs`<Footer />}`);

    // then
    expect(findAll('.footer-navigation__item')).to.have.lengthOf(5);
    expect(contains(this.intl.t('navigation.footer.a11y'))).to.exist;
    expect(contains(this.intl.t('navigation.footer.data-protection-policy'))).to.exist;
    expect(contains(this.intl.t('navigation.footer.eula'))).to.exist;
    expect(contains(this.intl.t('navigation.footer.help-center'))).to.exist;
    expect(contains(this.intl.t('navigation.footer.sitemap'))).to.exist;
  });

  it('should not display marianne logo when url does not have frenchDomainExtension', async function() {
    // given
    class UrlServiceStub extends Service {
      get isFrenchDomainExtension() {
        return false;
      }
    }
    this.owner.register('service:url', UrlServiceStub);

    // when
    await render(hbs`<Footer />`);

    // then
    expect(find('.footer-logos__french-government')).to.not.exist;
  });

  it('should display marianne logo when url does have frenchDomainExtension', async function() {
    // given
    class UrlServiceStub extends Service {
      get isFrenchDomainExtension() {
        return true;
      }
    }
    this.owner.register('service:url', UrlServiceStub);

    // when
    await render(hbs`<Footer />`);

    // then
    expect(find('.footer-logos__french-government')).to.exist;
  });

});
