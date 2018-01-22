import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import Component from '@ember/component';

const ORGANIZATION_CODE_PLACEHOLDER = 'Ex: ABCD12';
const STEP_1_ORGANIZATION_CODE_ENTRY = 'organization-code-entry';
const STEP_2_SHARING_CONFIRMATION = 'sharing-confirmation';
const STEP_3_SUCCESS_NOTIFICATION = 'success-notification';

export default Component.extend({

  classNames: ['share-profile'],

  // Actions
  searchForOrganization: null,
  shareProfileSnapshot: null,

  // Internals
  _showingModal: false,
  _view: STEP_1_ORGANIZATION_CODE_ENTRY,
  _placeholder: ORGANIZATION_CODE_PLACEHOLDER,
  _code: null,
  _organization: null,
  _organizationNotFound: false,
  _studentCode: null,
  _campaignCode: null,

  // Computed
  stepOrganizationCodeEntry: equal('_view', STEP_1_ORGANIZATION_CODE_ENTRY),
  stepProfileSharingConfirmation: equal('_view', STEP_2_SHARING_CONFIRMATION),
  isOrganizationHasTypeSup: equal('_organization.type', 'SUP'),
  isOrganizationHasTypeSupOrSco: computed('_organization.type', function() {
    return this.get('_organization.type') === 'SUP' || this.get('_organization.type') === 'SCO';
  }),

  organizationLabels: computed('_organization.type', function() {
    if (this.get('_organization.type') === 'PRO') {
      return {
        text1: 'Vous vous apprêtez à transmettre une copie de votre profil Pix à l\'organisation :',
        text2: 'En cliquant sur le bouton « Envoyer », elle recevra les informations suivantes :',
        text3: 'Elle ne recevra les évolutions futures de votre profil que si vous le partagez à nouveau.'
      };
    }
    return {
      text1: 'Vous vous apprêtez à transmettre une copie de votre profil Pix à l\'établissement :',
      text2: 'En cliquant sur le bouton « Envoyer », il recevra les informations suivantes :',
      text3: 'Il ne recevra les évolutions futures de votre profil que si vous le partagez à nouveau.'
    };
  }),

  actions: {

    openModal() {
      this.set('_showingModal', true);
    },

    closeModal() {
      this.set('_showingModal', false);
      this.set('_view', STEP_1_ORGANIZATION_CODE_ENTRY);
      this.set('_code', null);
      this.set('_organization', null);
      this.set('_organizationNotFound', false);
      this.set('_studentCode', null);
      this.set('_campaignCode', null);
    },

    cancelSharingAndGoBackToOrganizationCodeEntryView() {
      this.set('_view', STEP_1_ORGANIZATION_CODE_ENTRY);
      this.set('_organization', null);
      this.set('_organizationNotFound', false);
      this.set('_studentCode', null);
      this.set('_campaignCode', null);
    },

    findOrganizationAndGoToSharingConfirmationView() {
      this
        .get('searchForOrganization')(this.get('_code'))
        .then((organization) => {
          if (organization) {
            this.set('_view', STEP_2_SHARING_CONFIRMATION);
            this.set('_organization', organization);
            this.set('_organizationNotFound', false);
          } else {
            this.set('_organizationNotFound', true);
          }
        });
    },

    shareSnapshotAndGoToSuccessNotificationView() {
      this
        .get('shareProfileSnapshot')(this.get('_organization'), this.get('_studentCode'), this.get('_campaignCode'))
        .then(() => {
          this.set('_view', STEP_3_SUCCESS_NOTIFICATION);
        });
    },

    focusInOrganizationCodeInput() {
      this.set('_placeholder', null);
    },

    focusOutOrganizationCodeInput() {
      this.set('_placeholder', ORGANIZATION_CODE_PLACEHOLDER);
    }
  }
});
