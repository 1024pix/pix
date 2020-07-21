import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | certification-not-certifiable', function() {
  setupIntlRenderingTest();

  it('renders', async function() {

    await render(hbs`{{certification-not-certifiable}}`);

    expect(find('.certification-not-certifiable__title').textContent.trim()).to.equal('Votre profil n\'est pas encore certifiable.');
    expect(find('.certification-not-certifiable__text').textContent.trim()).to.equal('Pour faire certifier votre profil, vous devez avoir obtenu un niveau supérieur à 0 dans 5 compétences minimum.');
  });
});
