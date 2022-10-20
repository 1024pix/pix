import { describe, it } from 'mocha';
import { expect } from 'chai';
import { contains } from '../../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import Service from '@ember/service';
import { render } from '@1024pix/ember-testing-library';

describe('Integration | Component | Tutorials | Header', function () {
  setupIntlRenderingTest();

  beforeEach(function () {
    class RouterStub extends Service {
      currentRouteName = 'authenticated.user-tutorials.recommended';
    }
    this.owner.register('service:router', RouterStub);
  });

  it('renders the header', async function () {
    // when
    const screen = await render(hbs`<Tutorials::Header />`);

    // then
    expect(contains(this.intl.t('pages.user-tutorials.title'))).to.exist;
    expect(contains(this.intl.t('pages.user-tutorials.description'))).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('pages.user-tutorials.recommended') })).to.exist;
    expect(screen.getByRole('link', { name: this.intl.t('pages.user-tutorials.saved') })).to.exist;
  });

  describe('when shouldShowFilterButton is true', function () {
    it('should render filter button', async function () {
      // when
      const screen = await render(hbs`<Tutorials::Header @shouldShowFilterButton={{true}}/>`);

      // then
      expect(screen.getByRole('button', { name: 'Filtrer' })).to.exist;
    });
  });

  describe('when shouldShowFilterButton is false', function () {
    it('should render filter button', async function () {
      // when
      const screen = await render(hbs`<Tutorials::Header @shouldShowFilterButton={{false}}/>`);

      // then
      expect(screen.queryByRole('button', { name: 'Filtrer' })).to.not.exist;
    });
  });
});
