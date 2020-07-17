import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntegration from '../../helpers/setup-integration';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | navbar desktop menu', function() {
  setupIntegration();

  it('should be rendered', async function() {
    // when
    await render(hbs`{{navbar-desktop-menu}}`);

    // then
    expect(find('.navbar-desktop-menu')).to.exist;
  });
});
