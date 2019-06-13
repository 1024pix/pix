import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | logged user profile banner', function() {
  setupRenderingTest();

  it('should display a banner', async function() {
    // when
    await render(hbs`{{logged-user-profile-banner}}`);

    // then
    expect(find('.logged-user-profile-banner')).to.exist;
  });

  it('should have a content text container', async function() {
    // when
    await render(hbs`{{logged-user-profile-banner}}`);

    // then
    expect(findAll('.profile-banner__content-text-container')).to.have.lengthOf(1);
  });

  it('should a button cta to scroll to profile section', async function() {
    // when
    await render(hbs`{{logged-user-profile-banner}}`);

    // then
    expect(findAll('.profile-banner__button-scroll-container')).to.have.lengthOf(1);
    expect(findAll('.button-scroll-to-profile')).to.have.lengthOf(1);
    expect(find('.button-scroll-to-profile').textContent).to.equal('choisir un test');
  });

});
