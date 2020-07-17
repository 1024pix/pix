import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntegration from '../../helpers/setup-integration';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | checkpoint-continue', function() {
  setupIntegration();

  it('renders', async function() {
    await render(hbs`{{checkpoint-continue}}`);
    expect(find('.checkpoint__continue')).to.exist;
  });
});
