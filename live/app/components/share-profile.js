import Ember from 'ember';

const ORGANIZATION_CODE_PLACEHOLDER = 'Ex: ABCD12';
const STEP_1_ORGANIZATION_CODE_ENTRY = 'organization-code-entry';
const STEP_2_SHARING_CONFIRMATION = 'sharing-confirmation';
const STEP_3_SUCCESS_NOTIFICATION = 'success-notification';

export default Ember.Component.extend({

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

  // Computed
  stepOrganizationCodeEntry: Ember.computed.equal('_view', STEP_1_ORGANIZATION_CODE_ENTRY),
  stepProfileSharingConfirmation: Ember.computed.equal('_view', STEP_2_SHARING_CONFIRMATION),

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
    },

    cancelSharingAndGoBackToOrganizationCodeEntryView() {
      this.set('_view', STEP_1_ORGANIZATION_CODE_ENTRY);
      this.set('_organization', null);
      this.set('_organizationNotFound', false);
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
        .get('shareProfileSnapshot')(this.get('_organization'))
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
