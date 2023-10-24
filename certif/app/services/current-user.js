import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentUserService extends Service {
  @service session;
  @service store;
  @service router;

  @tracked certificationPointOfContact;
  @tracked currentAllowedCertificationCenterAccess;
  @tracked currentCertificationCenterMembership;
  @tracked isAdminOfCurrentCertificationCenter;

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.certificationPointOfContact = await this.store.queryRecord('certification-point-of-contact', {});

        this.currentAllowedCertificationCenterAccess = this.certificationPointOfContact
          .hasMany('allowedCertificationCenterAccesses')
          .value()[0];

        this.currentCertificationCenterMembership = this._findCertificationCenterMembershipByCertificationCenterId(
          this.currentAllowedCertificationCenterAccess?.id,
        );

        this.isAdminOfCurrentCertificationCenter = this.currentCertificationCenterMembership?.isAdmin;
      } catch (error) {
        this.certificationPointOfContact = null;
        this.currentAllowedCertificationCenterAccess = null;
        this.currentCertificationCenterMembership = null;
        this.isAdminOfCurrentCertificationCenter = false;

        return this.session.invalidate();
      }
    }
  }

  checkRestrictedAccess() {
    if (
      this.certificationPointOfContact.isMemberOfACertificationCenter &&
      this.currentAllowedCertificationCenterAccess.isAccessRestricted
    ) {
      return this.router.replaceWith('authenticated.restricted-access');
    }
  }

  updateCurrentCertificationCenter(certificationCenterId) {
    if (this.currentAllowedCertificationCenterAccess.id !== String(certificationCenterId)) {
      this.currentAllowedCertificationCenterAccess =
        this.certificationPointOfContact.allowedCertificationCenterAccesses.findBy('id', String(certificationCenterId));

      this.currentCertificationCenterMembership =
        this._findCertificationCenterMembershipByCertificationCenterId(certificationCenterId);
      this.isAdminOfCurrentCertificationCenter = this.currentCertificationCenterMembership?.isAdmin;
    }
  }

  _findCertificationCenterMembershipByCertificationCenterId(certificationCenterId) {
    return this.certificationPointOfContact.certificationCenterMemberships.find(
      (certificationCenterMembership) =>
        certificationCenterMembership.certificationCenterId === Number(certificationCenterId),
    );
  }
}
