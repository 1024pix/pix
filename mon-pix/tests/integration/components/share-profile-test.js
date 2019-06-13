import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { click, find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import RSVP from 'rsvp';

describe('Integration | Component | share profile', function() {

  setupRenderingTest();

  function expectToBeOnOrganizationCodeEntryView() {
    expect(find('.share-profile__section--organization-code-entry')).to.exist;
    expect(find('.share-profile__section--sharing-confirmation')).to.not.exist;
    expect(find('.share-profile__section--success-notification')).to.not.exist;
  }

  function expectToBeSharingConfirmationView() {
    expect(find('.share-profile__section--organization-code-entry')).to.not.exist;
    expect(find('.share-profile__section--sharing-confirmation')).to.exist;
    expect(find('.share-profile__section--success-notification')).to.not.exist;
  }

  function expectToBeOnSuccessNotificationView() {
    expect(find('.share-profile__section--organization-code-entry')).to.not.exist;
    expect(find('.share-profile__section--sharing-confirmation')).to.not.exist;
    expect(find('.share-profile__section--success-notification')).to.exist;
  }

  function expectModalToBeClosed() {
    expect(find('.pix-modal')).to.not.exist;
  }

  describe('Step 0 - "Share" button on modal wrapper', function() {

    it('should open profile sharing modal on "organization code entry" view', async function() {
      // given
      await render(hbs`{{share-profile}}`);
      expect(document.querySelectorAll('.pix-modal-dialog')).to.not.exist;

      // when
      await click('.share-profile__share-button');

      // then
      expect(document.querySelectorAll('.pix-modal-dialog')).to.exist;
      expect(document.querySelectorAll('.share-profile__section--organization-code-entry')).to.exist;
    });
  });

  describe('Step 1 - "Organization code entry" view', function() {

    it('should be the modal default view', async function() {
      // when
      await render(hbs`{{share-profile _showingModal=true}}`);

      // then
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should contain a text input for the organization code', async function() {
      // when
      await render(hbs`{{share-profile _showingModal=true}}`);

      // then
      expect(find('.share-profile__organization-code-input')).to.exist;
    });

    it('should contain a "Continue" button to find the organization', async function() {
      // when
      await render(hbs`{{share-profile _showingModal=true}}`);

      // then
      expect(find('.share-profile__continue-button')).to.exist;
    });

    it('should contain a "Cancel" button to cancel the profile sharing', async function() {
      // when
      await render(hbs`{{share-profile _showingModal=true}}`);

      // then
      expect(find('.share-profile__cancel-button')).to.exist;
    });

    it('should redirect to "sharing confirmation" view when clicking on "Continue" button', async function() {
      // given
      this.set('searchForOrganization', () => {
        const organization = EmberObject.create({ name: 'Pix' });
        return RSVP.resolve(organization);
      });
      await render(hbs`{{share-profile _showingModal=true _code="ABCD01" searchForOrganization=searchForOrganization}}`);

      // when
      await click('.share-profile__continue-button');

      // then
      expectToBeSharingConfirmationView();
    });

    it('should display an error message when no organization was found for the given code', async function() {
      // given
      this.set('searchForOrganization', function() {
        return RSVP.resolve(null);
      });
      await render(hbs`{{share-profile _showingModal=true searchForOrganization=searchForOrganization}}`);

      // when
      await click('.share-profile__continue-button');

      // then
      expect(find('.share-profile__form-error')).to.exist;
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should close the modal when clicking on "Cancel" button', async function() {
      // given
      await render(hbs`{{share-profile _showingModal=true}}`);

      // when
      await click('.share-profile__cancel-button');

      // then
      expectModalToBeClosed();
    });

  });

  describe('Step 2 - "Sharing confirmation" view', function() {

    it('should display the name of the found organization', async function() {
      // given
      this.set('organization', EmberObject.create({ name: 'Pix' }));

      // when
      await render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);

      // then
      expect(find('.share-profile__organization-name').textContent.trim()).to.equal('Pix');
    });

    describe('when organization\'s type is SUP', function() {

      beforeEach(async function() {
        // given
        this.set('organization', EmberObject.create({ name: 'Pix', type: 'SUP' }));

        // when
        await render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);
      });

      it('should ask for student code (required)', function() {
        // then
        expect(document.querySelector('.share-profile__student-code-input')).to.exist;
      });

      it('should ask for campaign code (optional)', function() {
        // then
        expect(document.querySelector('.share-profile__campaign-code-input')).to.exist;
      });

    });

    describe('when organization\'s type is SCO', function() {

      beforeEach(async function() {
        // given
        this.set('organization', EmberObject.create({ name: 'Pix', type: 'SCO' }));

        // when
        await render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);
      });

      it('should not ask for student code', function() {
        // then
        expect(document.querySelector('.share-profile__student-code-input')).to.not.exist;
      });

      it('should ask for campaign code', function() {
        // then
        expect(document.querySelector('.share-profile__campaign-code-input')).to.exist;
      });

    });

    describe('when organization\'s type is PRO', function() {

      beforeEach(async function() {
        // given
        this.set('organization', EmberObject.create({ name: 'Pix', type: 'PRO' }));

        // when
        await render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);
      });

      it('should ask for ID-Pix (optional)', function() {
        // then
        expect(document.querySelector('.share-profile__student-code-input')).to.exist;
      });

      it('should ask for campaign code (optional)', function() {
        // then
        expect(document.querySelector('.share-profile__campaign-code-input')).to.exist;
      });

    });

    it('should contain a "Confirm" button to valid the profile sharing', async function() {
      // when
      await render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation"}}`);

      // then
      expect(find('.share-profile__confirm-button')).to.exist;
    });

    it('should contain a "Cancel" button to cancel the profile sharing for the given organization', async function() {
      // when
      await render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation"}}`);

      // then
      expect(find('.share-profile__cancel-button')).to.exist;
    });

    it('should return back to "organization code entry" view when clicking on "Cancel" button', async function() {
      // given
      await render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation"}}`);

      // when
      await click('.share-profile__cancel-button');

      // then
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should create a Snapshot and send it to the organization previously found when clicking on "Continue" button', async function() {
      // given
      this.set('organization', EmberObject.create({ name: 'Pix' }));
      this.set('shareProfileSnapshot', () => {
        return RSVP.resolve(null);
      });
      await render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization shareProfileSnapshot=shareProfileSnapshot}}`);

      // when
      await click('.share-profile__confirm-button');

      // then
      expectToBeOnSuccessNotificationView();
    });

    it('should limit the lenght of the campainCode to 255 characters', async function() {
      // given
      this.set('organization', EmberObject.create({ name: 'Pix' }));

      // when
      await render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);

      // then
      expect(document.querySelector('.share-profile__campaign-code-input').getAttribute('maxlength')).to.equal('255');

    });

    it('should limit the lenght of the studentCode to 255 characters', async function() {
      // given
      this.set('organization', EmberObject.create({ name: 'Pix', type: 'SUP' }));

      // when
      await render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);

      // then
      expect(document.querySelector('.share-profile__student-code-input').getAttribute('maxlength')).to.equal('255');

    });

  });

  describe('Step 3 - "Success notification" view', function() {

    it('should contain a "Close" button that hide the modal', async function() {
      // when
      await render(hbs`{{share-profile _showingModal=true _view="success-notification"}}`);

      // then
      expect(find('.share-profile__close-button')).to.exist;
    });

    it('should close the modal when clicking on "Cancel" button', async function() {
      // given
      await render(hbs`{{share-profile _showingModal=true _view="success-notification"}}`);

      // when
      await click('.share-profile__close-button');

      // then
      expect(find('.pix-modal')).to.not.exist;
    });
  });

  describe('Borderline cases', function() {

    it('should open the modal on default "organization code entry" view even if modal was previously closed on "sharing confirmation" view', async function() {
      // given
      await render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation"}}`);
      await click('.pix-modal__close-link > a');

      // when
      await click('.share-profile__share-button');

      // then
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should open the modal on default "organization code entry" view even if modal was previously closed on "success notification" view', async function() {
      // given
      await render(hbs`{{share-profile _showingModal=true _view="success-notification"}}`);
      await click('.pix-modal__close-link > a');

      // when
      await click('.share-profile__share-button');

      // then
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should display the code input filled with the previously set organization code even after canceling sharing (step 2)', async function() {
      // given
      await render(hbs`{{share-profile _showingModal=true _code="ORGA00" _view="sharing-confirmation"}}`);

      // when
      await click('.share-profile__cancel-button');

      // then
      expect(find('.share-profile__organization-code-input').value).to.equal('ORGA00');
    });

  });

  describe('Actions', function() {

    beforeEach(async function() {
      // given
      this.set('showingModal', true);
      this.set('view', 'sharing-confirmation');
      this.set('code', 'ABCD1234');
      this.set('organization', { foo: 'bar' });
      this.set('organizationNotFound', true);
      this.set('studentCode', 'student_code');
      this.set('campaignCode', 'campaign_code');

      await render(hbs`{{share-profile
      _showingModal=showingModal
      _view=view
      _code=code
      _organization=organization
      _organizationNotFound=organizationNotFound
      _studentCode=studentCode
      _campaignCode=campaignCode}}`);
    });

    describe('#closeModal', function() {

      it('should remove all input information when modal is closed', async function() {
        // when
        await click('.pix-modal__close-link > a');

        // then
        expect(this.get('showingModal')).to.be.false;
        expect(this.get('view')).to.equal('organization-code-entry');
        expect(this.get('code')).to.be.null;
        expect(this.get('organization')).to.be.null;
        expect(this.get('organizationNotFound')).to.be.false;
        expect(this.get('studentCode')).to.be.null;
        expect(this.get('campaignCode')).to.be.null;
      });

    });

    describe('#cancelSharingAndGoBackToOrganizationCodeEntryView', function() {

      it('should remove all input information but organization code when sharing confirmation is canceled', async function() {
        // when
        await click('.share-profile__cancel-button');

        // then
        expect(this.get('showingModal')).to.be.true;
        expect(this.get('view')).to.equal('organization-code-entry');
        expect(this.get('code')).to.equal('ABCD1234');
        expect(this.get('organization')).to.be.null;
        expect(this.get('organizationNotFound')).to.be.false;
        expect(this.get('studentCode')).to.be.null;
        expect(this.get('campaignCode')).to.be.null;
      });
    });

  });

});
