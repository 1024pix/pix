import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { startApp, destroyApp } from '../helpers/application';
import seeds from '../helpers/seeds';
import { authenticateUser } from '../helpers/testing';

describe('Acceptance | Sharing a Profile Snapshot with a given Organization', function() {

  let application;

  beforeEach(function() {
    application = startApp();
  });

  afterEach(function() {
    destroyApp(application);
  });

  function populateDatabaseWithAUserAndAnOrganization() {
    seeds.injectUserAccount();
    seeds.injectOrganization('ABCD00');
  }

  async function visitAccountPage() {
    await visit('/compte');
  }

  function expectModalToBeOpened() {
    findWithAssert('.pix-modal');
  }

  function expectToBeOnOrganizationCodeEntryView() {
    findWithAssert('.share-profile__section--organization-code-entry');
  }

  async function openShareProfileModal() {
    await click('.share-profile__share-button');
  }

  function expectToBeOnSharingConfirmationView() {
    findWithAssert('.share-profile__section--sharing-confirmation');
  }

  async function fillInAndSubmitOrganizationCode() {
    await fillIn('.share-profile__organization-code-input', 'ABCD00');
    await click('.share-profile__continue-button');
  }

  function expectOrganizationNameToBeDisplayed() {
    expect(find('.share-profile__organization-name').text().trim()).to.equal('Organization 0');
  }

  function expectToBeOnSuccessNotificationView() {
    findWithAssert('.share-profile__section--success-notification');
  }

  function expectSnapshotToHaveBeenCreated() {
    expect(server.db.snapshots.length).to.equal(1);
  }

  async function confirmProfileSnapshotSharing() {
    await click('.share-profile__confirm-button');
  }

  function expectModalToBeClosed() {
    expect(find('.pix-modal')).to.have.length(0);
  }

  async function closeModal() {
    await click('.share-profile__close-button');
  }

  it('should be possible to share a snapshot of her own profile to a given organization', async function() {
    populateDatabaseWithAUserAndAnOrganization();
    authenticateUser();

    await visitAccountPage();

    await openShareProfileModal();
    expectModalToBeOpened();
    expectToBeOnOrganizationCodeEntryView();

    await fillInAndSubmitOrganizationCode();
    expectToBeOnSharingConfirmationView();
    expectOrganizationNameToBeDisplayed();

    await confirmProfileSnapshotSharing();
    expectToBeOnSuccessNotificationView();
    expectSnapshotToHaveBeenCreated();

    await closeModal();
    expectModalToBeClosed();
  });

});
