import { expect } from 'chai';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | CornerRibbonComponent', function() {

  setupIntlRenderingTest();

  it('renders', async function() {
    await render(hbs`{{corner-ribbon}}`);
    expect(find('.corner-ribbon')).to.exist;
  });

});
