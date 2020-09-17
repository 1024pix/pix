/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import { contains } from '../../helpers/contains';

describe('Integration | Component | Footer', function() {

  setupIntlRenderingTest();

  it('should be rendered', async function() {
    // when
    await render(hbs`<Footer />}`);

    // then
    expect(find('.footer')).to.exist;
  });

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
    expect(socialMediaLinks[0].href).to.equal('https://www.facebook.com/pg/Pix1024/');
    expect(socialMediaLinks[1].href).to.equal('https://www.linkedin.com/company/gip-pix');
    expect(socialMediaLinks[2].href).to.equal('https://twitter.com/Pix_officiel');
  });

  it('should display the navigation menu with expected elements', async function() {
    // when
    await render(hbs`<Footer />}`);

    // then
    expect(find('.footer-links__navigation')).to.exist;
    expect(findAll('.footer-navigation__item')).to.have.lengthOf(2);
    expect(contains('Centre d\'aide')).to.exist;
    expect(contains('Accessibilité')).to.exist;
  });

  it('should not display marianne logo when url does not have frenchDomainExtension', async function() {
    // given
    this.owner.register('service:url', Service.extend({ isFrenchDomainExtension: false }));

    // when
    await render(hbs`<Footer />`);

    // then
    expect(find('.footer-logos__french-government')).to.not.exist;
  });

  it('should display marianne logo when url does have frenchDomainExtension', async function() {
    // given
    this.owner.register('service:url', Service.extend({ isFrenchDomainExtension: true }));

    // when
    await render(hbs`<Footer />`);

    // then
    expect(find('.footer-logos__french-government')).to.exist;
  });

});
