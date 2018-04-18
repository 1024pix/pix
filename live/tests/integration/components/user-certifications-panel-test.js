import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | user certifications panel', function() {
  setupComponentTest('user-certifications-panel', {
    integration: true
  });

  it('renders', function() {
    this.render(hbs`{{user-certifications-panel}}`);
    expect(this.$()).to.have.length(1);
  });

  context('when there is no certifications', function() {

    it('should render a panel which indicate there is no certifications', function() {
      // when
      this.render(hbs`{{user-certifications-panel}}`);

      // then
      expect(this.$('.user-certifications-panel__no-certification-panel')).to.have.length(1);
    });
  });

  context('when there is some certifications to show', function() {

    it('should render a certifications list', function() {
      // given
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
      const certifications = [certification1, certification2];
      this.set('certifications', certifications);

      // when
      this.render(hbs`{{user-certifications-panel certifications=certifications}}`);

      // then
      expect(this.$('.user-certifications-panel__certifications-list')).to.have.length(1);
    });

  });

});
