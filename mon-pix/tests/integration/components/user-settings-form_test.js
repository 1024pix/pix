import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { render, find, fillIn, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { contains } from '../../helpers/contains';
import EmberObject from '@ember/object';
import sinon from 'sinon';

describe('Integration | Component | UserSettingsForm', function () {
  setupIntlRenderingTest();

  it('should display date of creation', async function () {
    // given
    const userSettings = EmberObject.create({
      updatedAt: '2020-12-11T14:30:40.109Z',
    });
    this.set('userSettings', userSettings);

    // when
    await render(hbs`<UserSettingsForm @userSettings={{this.userSettings}} />`);

    // then
    expect(contains('11 décembre 2020')).to.exist;
  });

  it('should display a placeholder when no color is selected', async function () {
    // given
    const userSettings = EmberObject.create({
      updatedAt: '2020-12-11T14:30:40.109Z',
    });
    this.set('userSettings', userSettings);

    // when
    await render(hbs`<UserSettingsForm @userSettings={{this.userSettings}} />`);

    // then
    expect(find('select').value).to.equal('');
    expect(contains('Sélectionner une couleur')).to.exist;
  });

  it('should display selected color', async function () {
    // given
    const userSettings = EmberObject.create({
      updatedAt: '2020-12-11T14:30:40.109Z',
      color: 'red',
    });
    this.set('userSettings', userSettings);

    // when
    await render(hbs`<UserSettingsForm @userSettings={{this.userSettings}} />`);

    // then
    expect(find('select').value).to.equal('red');
  });

  it('should save color', async function () {
    // given
    const saveStub = sinon.stub().resolves();
    const userSettings = EmberObject.create({
      updatedAt: '2020-12-11T14:30:40.109Z',
      color: 'red',
      save: saveStub,
    });
    this.set('userSettings', userSettings);

    // when
    await render(hbs`<UserSettingsForm @userSettings={{this.userSettings}} />`);
    await fillIn('select', 'green');
    await click('button');

    // then
    sinon.assert.calledOnce(saveStub);
    expect(userSettings.color).to.equal('green');
  });
});
