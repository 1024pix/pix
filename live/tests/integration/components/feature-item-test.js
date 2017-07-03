import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | feature item', function() {

  setupComponentTest('feature-item', {
    integration: true
  });

  const feature = {
    icon: 'reference',
    title: 'title_value',
    description: 'description_value'
  };

  it('renders', function() {
    this.set('feature', feature);
    this.render(hbs`{{feature-item feature=feature}}`);
    expect(this.$()).to.have.length(1);
  });

  it('should render an icon', function() {
    this.set('feature', feature);
    this.render(hbs`{{feature-item feature=feature}}`);

    const $icon = this.$('.feature-item__icon');
    expect($icon).to.exist;
    expect($icon.attr('src')).to.equal('/images/features/icon-reference.svg');
  });

  it('should render an title', function() {
    this.set('feature', feature);
    this.render(hbs`{{feature-item feature=feature}}`);

    const $title = this.$('.feature-item__title');
    expect($title).to.exist;
    expect($title.text().trim()).to.equal(feature.title);
  });

  it('should render an description', function() {
    this.set('feature', feature);
    this.render(hbs`{{feature-item feature=feature}}`);

    const $description = this.$('.feature-item__description');
    expect($description).to.exist;
    expect($description.text().trim()).to.equal(feature.description);
  });

});
