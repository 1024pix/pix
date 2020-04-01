import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | warning-banner', function() {
  setupRenderingTest();

  it('should not display the banner when not in staging', async function() {
    // given
    this.set('isEnabled', false);

    // when
    await render(hbs`{{warning-banner isEnabled=isEnabled}}`);

    // then
    expect(find('.warning-banner')).to.not.exist;
  });

  it('should display the banner when in staging', async function() {
    // given
    this.set('isEnabled', true);

    // when
    await render(hbs`{{warning-banner isEnabled=isEnabled}}`);

    // then
    expect(find('.warning-banner')).to.exist;
  });
});
