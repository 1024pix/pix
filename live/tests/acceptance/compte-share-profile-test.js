import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';
import seeds from '../helpers/seeds';
import testing from '../helpers/testing';

describe('Acceptance | Compte | share profile', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  it('display an error when the organization does not exists', async function() {
    // given
    seeds.injectUserAccount();
    testing.authenticateUser();

    // when
    await visit('/compte');

    click('.share-profile__share-button');
    fillIn('.ember-modal-dialog #code', 'ABCD01');
    click('.pix-modal__button--primary');

    return andThen(() => {
      expect(find('.ember-modal-dialog h1').text()).to.equal('Partage de votre profil');
      expect(find('.ember-modal-dialog #code').val()).to.equal('ABCD01');
      expect(find('.share-profile__modal-form > .share-profile__form-error').length).to.equal(1);
      expect(find('.share-profile__modal-form > .share-profile__form-error').text())
        .to.equal('Ce code ne correspond à aucune organization.');
    });
  });

  it('should switch to another display', async function() {
    // given
    seeds.injectUserAccount();
    const organization = seeds.injectOrganization('ABCD00');
    testing.authenticateUser();

    // when
    await visit('/compte');

    click('.share-profile__share-button');
    fillIn('.ember-modal-dialog #code', 'ABCD00');
    click('.pix-modal__button--primary');

    return andThen(() => {
      const MODAL_CONTENT = find('.share-profile__modal-content-organization-details');

      expect(find('.ember-modal-dialog h1').text()).to.equal('Partage de votre profil');
      expect(find('.ember-modal-dialog #code')).to.have.length(0);
      expect(MODAL_CONTENT.find('.share-profile__modal-organization-name').text()).to.equal(organization.name);
    });
  });
});
