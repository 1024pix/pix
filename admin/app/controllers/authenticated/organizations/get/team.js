import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { debounce } from '@ember/runloop';
import config from 'pix-admin/config/environment';

const DEFAULT_PAGE_NUMBER = 1;

export default class GetTeamController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'firstName', 'lastName', 'email', 'organizationRole'];
  DEBOUNCE_MS = config.pagination.debounce;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked userEmailToAdd = null;
  @tracked isLoading = false;
  @tracked firstName = null;
  @tracked lastName = null;
  @tracked email = null;
  @tracked organizationRole = null;
  pendingFilters = {};

  @service accessControl;
  @service notifications;
  @service store;

  updateFilters() {
    // eslint-disable-next-line ember/classic-decorator-no-classic-methods
    this.setProperties(this.pendingFilters);
    this.pendingFilters = {};
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  triggerFiltering(fieldName, event) {
    const value = event.target.value;
    this.pendingFilters[fieldName] = value;
    debounce(this, this.updateFilters, this.DEBOUNCE_MS);
  }

  @action
  selectRoleForSearch(value) {
    this.organizationRole = value;
  }

  async _getUser(email) {
    const emailInLowerCase = email.toLowerCase();
    const matchingUsers = await this.store.query('user', { filter: { email: emailInLowerCase } });
    // GET /users?filter[email] makes an approximative request ("LIKE %email%") and not a strict request
    return matchingUsers.findBy('email', emailInLowerCase);
  }

  @action
  async addOrganizationMembership() {
    const organization = this.model;
    const email = this.userEmailToAdd.trim();
    const user = await this._getUser(email);
    if (!user) {
      return this.notifications.error('Compte inconnu.');
    }

    if (await organization.hasMember(user.id)) {
      return this.notifications.error('Compte déjà associé.');
    }

    try {
      await this.store.createRecord('organization-membership', { organization, user }).save();

      await organization.organizationMemberships.reload({
        adapterOptions: {
          'page[size]': this.pageSize,
          'page[number]': this.pageNumber,
          'filter[firstName]': this.firstName,
          'filter[lastName]': this.lastName,
          'filter[email]': this.email,
          'filter[organizationRole]': this.organizationRole,
        },
      });

      this.userEmailToAdd = null;
      this.notifications.success('Accès attribué avec succès.');
    } catch (e) {
      this.notifications.error('Une erreur est survenue.');
    }
  }

  @action
  onChangeUserEmailToAdd(event) {
    this.userEmailToAdd = event.target.value;
  }
}
