import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import hbs from 'htmlbars-inline-precompile';
import { render } from '@1024pix/ember-testing-library';

describe('Integration | Component | Footer', function () {
  setupIntlRenderingTest();

  it('should display the Pix logo', async function () {
    // when
    const screen = await render(hbs`<Footer />}`);

    // then
    expect(screen.getByAltText(this.intl.t('navigation.homepage'))).to.exist;
  });

  it('should display the navigation menu with expected elements', async function () {
    // when
    const screen = await render(hbs`<Footer />}`);

    // then
    expect(screen.getByRole('link', { name: this.intl.t('navigation.footer.a11y') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('navigation.footer.data-protection-policy') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('navigation.footer.student-data-protection-policy') })).to
      .exist;
    expect(screen.getByRole('link', { name: this.intl.t('navigation.footer.eula') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('navigation.footer.help-center') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('navigation.footer.sitemap') })).to.exist;
  });

  it('should not display marianne logo when url does not have frenchDomainExtension', async function () {
    // given
    class UrlServiceStub extends Service {
      get isFrenchDomainExtension() {
        return false;
      }
    }
    this.owner.register('service:url', UrlServiceStub);

    // when
    const screen = await render(hbs`<Footer />`);

    // then
    expect(screen.queryByAltText(this.intl.t('common.french-republic'))).to.not.exist;
  });

  it('should display marianne logo when url does have frenchDomainExtension', async function () {
    // given
    class UrlServiceStub extends Service {
      get isFrenchDomainExtension() {
        return true;
      }
    }
    this.owner.register('service:url', UrlServiceStub);

    // when
    const screen = await render(hbs`<Footer />`);

    // then
    expect(screen.getByAltText(this.intl.t('common.french-republic'))).to.exist;
  });

  it('should display the student data policy', async function () {
    // given & when
    const screen = await render(hbs`<Footer />}`);

    // then
    expect(screen.getByRole('link', { name: this.intl.t('navigation.footer.student-data-protection-policy') })).to
      .exist;
  });
});
