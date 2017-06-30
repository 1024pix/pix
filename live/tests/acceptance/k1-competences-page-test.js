import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

describe('Acceptance | competences page', function() {

  let application;

  beforeEach(function() {
    application = startApp();
    visit('/competences');
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('can visit /competences', function() {
    expect(currentURL()).to.equal('/competences');
  });

  it('should display page title', function() {
    expect(find('.competences-page__header-text')).to.have.lengthOf(1);
  });

  it('should display as many sections as competences domains', function() {
    expect(find('.competences-domain')).to.have.lengthOf(5);
  });

  it('should hide all sections by default', function() {
    expect(find('.competences-domain__topics')).to.have.lengthOf(0);
  });

  it('should open a section when one clicks on its title', function() {
    const $firstSectionHeader = find('.competences-domain__header').first();
    click($firstSectionHeader);
    return andThen(() => {
      expect(find('.competences-domain__topics')).to.have.lengthOf(1);
    });
  });

});
