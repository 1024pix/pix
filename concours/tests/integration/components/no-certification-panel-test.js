import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | no certification panel', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{no-certification-panel}}`);
    expect(find('.no-certification-panel')).to.exist;
  });
});
