import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | certifications list', function() {
  setupComponentTest('certifications-list', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{certifications-list}}`);
    expect(this.$()).to.have.length(1);
  });

  context('when there is some completed certifications', function() {

    const certification1 = EmberObject.create({
      id: 1,
      date: '14/08/2018',
      status: 'completed',
      score: '123',
      certificationCenter: 'Université de Paris'
    });
    const certification2 = EmberObject.create({
      id: 2,
      date: '11/07/2017',
      status: 'completed',
      score: '456',
      certificationCenter: 'Université de Lyon'
    });

    it('should render two certification items when there is 2 completed certifications', function() {
      const completedCertifications = [certification1, certification2];
      this.set('certifications', completedCertifications);

      // when
      this.render(hbs`{{certifications-list certifications=certifications}}`);

      // then
      expect(this.$('.certifications-list__certification-item')).to.have.lengthOf(2);
    });

  });

});
