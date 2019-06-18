import { expect } from 'chai';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | CornerRibbonComponent', function() {

  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{corner-ribbon}}`);
    expect(find('.corner-ribbon')).to.exist;
  });

});
