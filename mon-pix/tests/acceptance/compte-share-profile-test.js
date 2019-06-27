import { click, fillIn, find } from '@ember/test-helpers';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { authenticateAsSimpleUser } from '../helpers/testing';
import visitWithAbortedTransition from '../helpers/visit';
import defaultScenario from '../../mirage/scenarios/default';
import { setupApplicationTest } from 'ember-mocha';
import { setupMirage } from 'ember-cli-mirage/test-support';

describe('Acceptance | Sharing a Profile Snapshot with a given Organization', function() {
  setupApplicationTest();
  setupMirage();

  beforeEach(function() {
    defaultScenario(this.server);
  });

  async function visitAccountPage() {
    await visitWithAbortedTransition('/compte');
  }

  function expectModalToBeOpened() {
    expect(find('.pix-modal-dialog')).to.exist;
  }

  function expectToBeOnOrganizationCodeEntryView() {
    expect(find('.share-profile__section--organization-code-entry')).to.exist;
  }

  async function openShareProfileModal() {
    await click('.share-profile__share-button');
  }

  function expectToBeOnSharingConfirmationView() {
    expect(find('.share-profile__section--sharing-confirmation')).to.exist;
  }

  async function fillInAndSubmitOrganizationCode() {
    await fillIn('.share-profile__organization-code-input', 'PRO001');
    await click('.share-profile__continue-button');
  }

  function expectOrganizationNameToBeDisplayed() {
    expect(find('.share-profile__organization-name').textContent.trim()).to.equal('Mon Entreprise');
  }

  function expectToBeOnSuccessNotificationView() {
    expect(find('.share-profile__section--success-notification')).to.exist;
  }

  function expectSnapshotToHaveBeenCreated(server) {
    expect(server.db.snapshots.length).to.equal(4);
  }

  async function confirmProfileSnapshotSharing() {
    await click('.share-profile__confirm-button');
  }

  function expectModalToBeClosed() {
    expect(find('.pix-modal')).to.not.exist;
  }

  async function closeModal() {
    await click('.share-profile__close-button');
  }

  it('should be possible to share a snapshot of her own profile to a given organization', async function() {
    await authenticateAsSimpleUser();

    await visitAccountPage();

    await openShareProfileModal();
    expectModalToBeOpened();
    expectToBeOnOrganizationCodeEntryView();

    await fillInAndSubmitOrganizationCode();
    expectToBeOnSharingConfirmationView();
    expectOrganizationNameToBeDisplayed();

    await confirmProfileSnapshotSharing();
    expectToBeOnSuccessNotificationView();
    expectSnapshotToHaveBeenCreated(this.server);

    await closeModal();
    expectModalToBeClosed();
  });

});
