import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

describe('Integration | Component | competence area item', function() {
  setupComponentTest('competence-by-area-item', {
    integration: true
  });

  it('should render', function() {
    // when
    this.render(hbs`{{competence-by-area-item}}`);

    // then
    expect(this.$('.competence-by-area-item')).to.have.lengthOf(1);
  });

  it('should render a title', function() {
    // Given
    const competence = Ember.Object.create({ name: 'competence-A', level: 1 });
    const areaWithOnlyOneCompetence = { property: 'area', value: '1. Information et données', items: [competence] };
    this.set('competenceArea', areaWithOnlyOneCompetence);
    // when
    this.render(hbs`{{competence-by-area-item competenceArea=competenceArea}}`);
    // then
    expect(this.$('.area__name').text().trim()).to.equal('Information et données');
  });

  it('should render as many competences as received', function() {
    // given
    const competencesWithSameArea = [
      Ember.Object.create({ id: 1, name: 'competence-name-1', area: 'area-id-1' }),
      Ember.Object.create({ id: 2, name: 'competence-name-2', area: 'area-id-1' }),
      Ember.Object.create({ id: 3, name: 'competence-name-3', area: 'area-id-1' }),
      Ember.Object.create({ id: 4, name: 'competence-name-4', area: 'area-id-1' }),
      Ember.Object.create({ id: 5, name: 'competence-name-5', area: 'area-id-1' })
    ];
    const areaWithManyCompetences = {
      property: 'area',
      value: 'Information et données',
      items: competencesWithSameArea
    };

    this.set('competenceArea', areaWithManyCompetences);
    // when
    this.render(hbs`{{competence-by-area-item competenceArea=competenceArea}}`);

    // then
    expect(this.$('.competence__name')).to.have.lengthOf(5);
  });

  describe('Competence rendering', function() {
    it('should render its name', function() {
      // given
      const competence = Ember.Object.create({ name: 'Mener une recherche et une veille d’information' });
      const areaWithOnlyOneCompetence = { property: 'area', value: '1. Information et données', items: [competence] };
      this.set('competenceArea', areaWithOnlyOneCompetence);

      // when
      this.render(hbs`{{competence-by-area-item competenceArea=competenceArea}}`);

      // then
      expect(this.$('.competence__name').text().trim()).to.equal('Mener une recherche et une veille d’information');
    });

    it('should render the relative level progress bar for user', function() {
      // given
      const competence = Ember.Object.create();
      const areaWithOnlyOneCompetence = { property: 'area', value: '1. Information et données', items: [competence] };
      this.set('competenceArea', areaWithOnlyOneCompetence);

      // when
      this.render(hbs`{{competence-by-area-item competenceArea=competenceArea}}`);

      // then
      expect(this.$('.competence__progress-bar')).to.have.lengthOf(1);
    });
  });
});
