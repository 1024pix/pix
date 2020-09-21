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

  it('should display social medias links menu with expected elements', async function() {
    // when
    await render(hbs`<Footer />}`);

    // then
    expect(find('.footer-links__social-medias')).to.exist;

    const socialMediaLinks = findAll('.footer-social-medias__item');
    expect(socialMediaLinks).to.have.lengthOf(3);
    expect(socialMediaLinks[0].href).to.equal(this.intl.t('navigation.footer.social-medias.link.facebook'));
    expect(socialMediaLinks[1].href).to.equal(this.intl.t('navigation.footer.social-medias.link.linkedin'));
    expect(socialMediaLinks[2].href).to.equal(this.intl.t('navigation.footer.social-medias.link.twitter'));
  });

  it('should display the navigation menu with expected elements', async function() {
    // when
    await render(hbs`<Footer />}`);

    // then
    expect(find('.footer-links__navigation')).to.exist;
    expect(findAll('.footer-navigation__item')).to.have.lengthOf(2);
    expect(contains(this.intl.t('navigation.footer.a11y'))).to.exist;
    expect(contains(this.intl.t('navigation.footer.help-center'))).to.exist;
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
