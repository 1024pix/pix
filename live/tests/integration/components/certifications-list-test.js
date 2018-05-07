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
      date: '2018-02-15T15:15:52.504Z',
      status: 'validated',
      certificationCenter: 'Université de Paris',
      isPublished: true,
      pixScore: 231
    });
    const certification2 = EmberObject.create({
      id: 2,
      date: '2018-02-15T15:15:52.504Z',
      status: 'rejected',
      certificationCenter: 'Université de Lyon',
      isPublished: true,
      pixScore: 231
    });

    it('should render two certification items when there is 2 completed certifications', function() {
      const completedCertifications = [certification1, certification2];
      this.set('certifications', completedCertifications);

      // when
      this.render(hbs`{{certifications-list certifications=certifications}}`);

      // then
      expect(this.$('.certifications-list__table-body .certifications-list-item')).to.have.lengthOf(2);
    });
  });
});
