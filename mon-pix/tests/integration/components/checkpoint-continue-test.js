import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | checkpoint-continue', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{checkpoint-continue}}`);
    expect(find('.checkpoint__continue')).to.exist;
  });
});
