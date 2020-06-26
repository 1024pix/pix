import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | Badge Acquired Card', function() {
  setupRenderingTest();

  beforeEach(function() {
    this.set('title', 'Badge de winner');
    this.set('message', 'Bravo ! Tu as ton badge !');
    this.set('imageUrl', '/images/hexa-pix.svg');
    this.set('altMessage', 'Ceci est un badge.');
  });

  it('should render the badge acquired card', async function() {
    // when
    await render(hbs`<BadgeAcquiredCard @message={{this.message}} @title={{this.title}} @imageUrl={{this.imageUrl}} @altMessage={{this.altMessage}} />`);

    // then
    expect(find('.badge-acquired-card')).to.exist;
    expect(find('.badge-acquired-card-text__title').textContent.trim()).to.equal('Badge de winner');
    expect(find('.badge-acquired-card-text__message').textContent.trim()).to.equal('Bravo ! Tu as ton badge !');
  });
});
