import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | placement-banner', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{placement-banner}}`);
    expect(find('.placement-banner')).to.exist;
  });
});
