import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import RSVP from 'rsvp';

describe('Integration | Component | share profile', function() {

  setupComponentTest('share-profile', {
    integration: true,

    // the only way to stub ember-tabbable/jquery-tabbable initializer
    beforeSetup() {
      $.extend($.expr[':'], {
        tabbable: () => true
      });
    }
  });

  function expectToBeOnOrganizationCodeEntryView() {
    expect(Ember.$('.share-profile__section--organization-code-entry')).to.have.lengthOf(1);
    expect(Ember.$('.share-profile__section--sharing-confirmation')).to.have.lengthOf(0);
    expect(Ember.$('.share-profile__section--success-notification')).to.have.lengthOf(0);
  }

  function expectToBeSharingConfirmationView() {
    expect(Ember.$('.share-profile__section--organization-code-entry')).to.have.lengthOf(0);
    expect(Ember.$('.share-profile__section--sharing-confirmation')).to.have.lengthOf(1);
    expect(Ember.$('.share-profile__section--success-notification')).to.have.lengthOf(0);
  }

  function expectToBeOnSuccessNotificationView() {
    expect(Ember.$('.share-profile__section--organization-code-entry')).to.have.lengthOf(0);
    expect(Ember.$('.share-profile__section--sharing-confirmation')).to.have.lengthOf(0);
    expect(Ember.$('.share-profile__section--success-notification')).to.have.lengthOf(1);
  }

  function expectModalToBeClosed() {
    expect(Ember.$('.pix-modal')).to.have.lengthOf(0);
  }

  describe('Step 0 - "Share" button on modal wrapper', function() {

    it('should open profile sharing modal on "organization code entry" view', function() {
      // given
      this.render(hbs`{{share-profile}}`);
      expect(Ember.$('.pix-modal')).to.have.lengthOf(0);

      // when
      Ember.run(() => document.querySelector(('.share-profile__share-button')).click());

      // then
      expect(Ember.$('.pix-modal')).to.have.lengthOf(1);
      expect(Ember.$('.share-profile__section--organization-code-entry')).to.have.lengthOf(1);
    });
  });

  describe('Step 1 - "Organization code entry" view', function() {

    it('should be the modal default view', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true}}`);

      // then
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should contain a text input for the organization code', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true}}`);

      // then
      expect(Ember.$('.share-profile__organization-code-input')).to.have.lengthOf(1);
    });

    it('should contain a "Continue" button to find the organization', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true}}`);

      // then
      expect(Ember.$('.share-profile__continue-button')).to.have.lengthOf(1);
    });

    it('should contain a "Cancel" button to cancel the profile sharing', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true}}`);

      // then
      expect(Ember.$('.share-profile__cancel-button')).to.have.lengthOf(1);
    });

    it('should redirect to "sharing confirmation" view when clicking on "Continue" button', function() {
      // given
      this.set('searchForOrganization', () => {
        const organization = Ember.Object.create({ name: 'Pix' });
        return RSVP.resolve(organization);
      });
      this.render(hbs`{{share-profile _showingModal=true _code="ABCD01" searchForOrganization=searchForOrganization}}`);

      // when
      Ember.run(() => document.querySelector('.share-profile__continue-button').click());

      // then
      expectToBeSharingConfirmationView();
    });

    it('should display an error message when no organization was found for the given code', function() {
      // given
      this.set('searchForOrganization', function() {
        return RSVP.resolve(null);
      });
      this.render(hbs`{{share-profile _showingModal=true searchForOrganization=searchForOrganization}}`);

      // when
      Ember.run(() => document.querySelector('.share-profile__continue-button').click());

      // then
      expect(Ember.$('.share-profile__form-error')).to.have.lengthOf(1);
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should close the modal when clicking on "Cancel" button', function() {
      // given
      this.render(hbs`{{share-profile _showingModal=true}}`);

      // when
      Ember.run(() => document.querySelector('.share-profile__cancel-button').click());

      // then
      expectModalToBeClosed();
    });

  });

  describe('Step 2 - "Sharing confirmation" view', function() {

    it('should display the name of the found organization', function() {
      // given
      this.set('organization', Ember.Object.create({ name: 'Pix' }));

      // when
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);

      // then
      expect(Ember.$('.share-profile__organization-name').text().trim()).to.equal('Pix');
    });

    describe('when organization\'s type is SUP', function() {

      beforeEach(function() {
        // given
        this.set('organization', Ember.Object.create({ name: 'Pix', type: 'SUP' }));

        // when
        this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);
      });

      it('should ask for student code (required)', function() {
        // then
        expect(document.querySelector('.share-profile__student-code-input')).to.exist;
      });

      it('should ask for campaign code (optionnal)', function() {
        // then
        expect(document.querySelector('.share-profile__campaign-code-input')).to.exist;
      });

    });

    describe('when organization\'s type is SCO', function() {

      beforeEach(function() {
        // given
        this.set('organization', Ember.Object.create({ name: 'Pix', type: 'SCO' }));

        // when
        this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);
      });

      it('should not ask for student code (required)', function() {
        // then
        expect(document.querySelector('.share-profile__student-code-input')).to.not.exist;
      });

      it('should not ask for campaign code (optionnal)', function() {
        // then
        expect(document.querySelector('.share-profile__campaign-code-input')).to.not.exist;
      });

    });

    describe('when organization\'s type is PRO', function() {

      beforeEach(function() {
        // given
        this.set('organization', Ember.Object.create({ name: 'Pix', type: 'PRO' }));

        // when
        this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization}}`);
      });

      it('should not ask for student code (required)', function() {
        // then
        expect(document.querySelector('.share-profile__student-code-input')).to.not.exist;
      });

      it('should not ask for campaign code (optionnal)', function() {
        // then
        expect(document.querySelector('.share-profile__campaign-code-input')).to.not.exist;
      });

    });

    it('should contain a "Confirm" button to valid the profile sharing', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation"}}`);

      // then
      expect(Ember.$('.share-profile__confirm-button')).to.have.lengthOf(1);
    });

    it('should contain a "Cancel" button to cancel the profile sharing for the given organization', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation"}}`);

      // then
      expect(Ember.$('.share-profile__cancel-button')).to.have.lengthOf(1);
    });

    it('should return back to "organization code entry" view when clicking on "Cancel" button', function() {
      // given
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation"}}`);

      // when
      Ember.run(() => document.querySelector('.share-profile__cancel-button').click());

      // then
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should create a Snapshot and send it to the organization previously found when clicking on "Continue" button', function() {
      // given
      this.set('organization', Ember.Object.create({ name: 'Pix' }));
      this.set('shareProfileSnapshot', () => {
        return RSVP.resolve(null);
      });
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation" _organization=organization shareProfileSnapshot=shareProfileSnapshot}}`);

      // when
      Ember.run(() => document.querySelector('.share-profile__confirm-button').click());

      // then
      expectToBeOnSuccessNotificationView();
    });

  });

  describe('Step 3 - "Success notification" view', function() {

    it('should contain a "Close" button that hide the modal', function() {
      // when
      this.render(hbs`{{share-profile _showingModal=true _view="success-notification"}}`);

      // then
      expect(Ember.$('.share-profile__close-button')).to.have.lengthOf(1);
    });

    it('should close the modal when clicking on "Cancel" button', function() {
      // given
      this.render(hbs`{{share-profile _showingModal=true _view="success-notification"}}`);

      // when
      Ember.run(() => document.querySelector('.share-profile__close-button').click());

      // then
      expect(Ember.$('.pix-modal')).to.have.lengthOf(0);
    });
  });

  describe('Borderline cases', function() {

    it('should open the modal on default "organization code entry" view even if modal was previously closed on "sharing confirmation" view', function() {
      // given
      this.render(hbs`{{share-profile _showingModal=true _view="sharing-confirmation"}}`);
      Ember.run(() => document.querySelector('.pix-modal__close-link').click());

      // when
      Ember.run(() => document.querySelector('.share-profile__share-button').click());

      // then
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should open the modal on default "organization code entry" view even if modal was previously closed on "success notification" view', function() {
      // given
      this.render(hbs`{{share-profile _showingModal=true _view="success-notification"}}`);
      Ember.run(() => document.querySelector('.pix-modal__close-link').click());

      // when
      Ember.run(() => document.querySelector('.share-profile__share-button').click());

      // then
      expectToBeOnOrganizationCodeEntryView();
    });

    it('should display the code input filled with the previously set organization code even after canceling sharing (step 2)', function() {
      // given
      this.render(hbs`{{share-profile _showingModal=true _code="ORGA00" _view="sharing-confirmation"}}`);

      // when
      Ember.run(() => document.querySelector('.share-profile__cancel-button').click());

      // then
      expect(Ember.$('.share-profile__organization-code-input').val()).to.equal('ORGA00');
    });

  });

  describe('Actions', function() {

    beforeEach(function() {
      // given
      this.set('showingModal', true);
      this.set('view', 'sharing-confirmation');
      this.set('code', 'ABCD1234');
      this.set('organization', { foo: 'bar' });
      this.set('organizationNotFound', true);
      this.set('studentCode', 'student_code');
      this.set('campaignCode', 'campaign_code');

      this.render(hbs`{{share-profile 
      _showingModal=showingModal 
      _view=view 
      _code=code
      _organization=organization
      _organizationNotFound=organizationNotFound
      _studentCode=studentCode 
      _campaignCode=campaignCode}}`);
    });

    describe('#closeModal', function() {

      it('should remove all input information when modal is closed', function() {
        // when
        Ember.run(() => document.querySelector('.pix-modal__close-link').click());

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

      it('should remove all input information but organization code when sharing confirmation is canceled', function() {
        // when
        Ember.run(() => document.querySelector('.share-profile__cancel-button').click());

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
