import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';

describe.only('Integration | Component | learning-more-panel', function() {
  setupComponentTest('learning-more-panel', {
    integration: true
  });

  it('renders a list item when there is at least one learningMore item', function() {
    // given
    this.set('learningMoreList', [{}]);

    // when
    this.render(hbs`{{learning-more-panel learningMoreList=learningMoreList}}`);

    // then
    expect(this.$('.learning-more-panel__container')).to.have.length(1);
    expect(this.$('.learning-more-panel__container').text()).to.contains('Pour en apprendre davantage');
  });

  it('should not render a list when there is no LearningMore elements', function() {
    // given
    this.set('learningMoreList', null);

    // when
    this.render(hbs`{{learning-more-panel learningMoreList=learningMoreList}}`);

    // then
    expect(this.$('.learning-more-panel__container')).to.have.lengthOf(0);
  });
});
