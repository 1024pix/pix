import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | trophy item', function() {
  setupComponentTest('trophy-item', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{trophy-item}}`);
    expect(this.$()).to.have.length(1);
  });

  it('should contain the level passed in the component', function() {
    // given
    const level = 3;
    this.set('level', level);

    // when
    this.render(hbs`{{trophy-item level=level}}`);

    // then
    expect(this.$('.trophy-item__level').text()).to.contain(level.toString());
  });

  it('should contain an image of a trophy with the text "NIVEAU"', function() {
    // when
    this.render(hbs`{{trophy-item}}`);

    // then
    expect(this.$('.trophy-item__img').length).to.equal(1);
    expect(this.$('.trophy-item__level').text()).to.contain('NIVEAU');
  });
});
