import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | certifications list', function() {
  setupRenderingTest();

  it('renders', async function() {
    await render(hbs`{{certifications-list}}`);
    expect(find('.certifications-list__table')).to.exist;
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

    it('should render two certification items when there is 2 completed certifications', async function() {
      const completedCertifications = [certification1, certification2];
      this.set('certifications', completedCertifications);

      // when
      await render(hbs`{{certifications-list certifications=certifications}}`);

      // then
      expect(findAll('.certifications-list__table-body .certifications-list-item').length).to.equal(2);
    });
  });
});
