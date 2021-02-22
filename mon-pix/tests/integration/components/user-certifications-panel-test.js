import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

describe('Integration | Component | user certifications panel', function() {
  setupIntlRenderingTest();

  it('renders', async function() {
    await render(hbs`<UserCertificationsPanel />`);
    expect(find('.user-certifications-panel')).to.exist;
  });

  context('when there is no certifications', function() {

    it('should render a panel which indicate there is no certifications', async function() {
      // when
      await render(hbs`<UserCertificationsPanel />`);

      // then
      expect(find('.user-certifications-panel__no-certification-panel')).to.exist;
    });
  });

  context('when there is some certifications to show', function() {

    it('should render a certifications list', async function() {
      // given
      const certification1 = EmberObject.create({
        id: 1,
        date: '2018-02-15T15:15:52.504Z',
        status: 'completed',
        certificationCenter: 'Université de Paris',
      });
      const certification2 = EmberObject.create({
        id: 2,
        date: '2018-02-15T15:15:52.504Z',
        status: 'completed',
        certificationCenter: 'Université de Lyon',
      });
      const certifications = [certification1, certification2];
      this.set('certifications', certifications);

      // when
      await render(hbs`<UserCertificationsPanel @certifications={{this.certifications}}/>`);

      // then
      expect(find('.user-certifications-panel__certifications-list')).to.exist;
    });

  });

});
