import { expect } from 'chai';
import setupIntegration from '../../helpers/setup-integration';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | CornerRibbonComponent', function() {

  setupIntegration();

  it('renders', async function() {
    await render(hbs`{{corner-ribbon}}`);
    expect(find('.corner-ribbon')).to.exist;
  });

});
