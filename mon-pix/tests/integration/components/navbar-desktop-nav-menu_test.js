import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | navbar desktop menu', function() {
  setupIntlRenderingTest();

  it('should be rendered', async function() {
    // when
    await render(hbs`<NavbarDesktopMenu/>`);

    // then
    expect(find('.navbar-desktop-menu')).to.exist;
  });
});
