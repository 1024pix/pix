import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

describe('Integration | Component |  <%= dasherizedModuleName %>', function() {
  setupRenderingTest();

  it('replace this by your real test', async function() {
    // given

    //  when
    await render(hbs`<<%= classifiedModuleName %> />`);

    // then
    expect(true).to.be.true;
  });
});
