import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ListController extends Controller {
  @service currentUser;
  @service intl;

  @tracked pageNumber = 1;
  @tracked pageSize = 25;
  @tracked fullName = null;
  @tracked certificability = [];

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value || undefined;
    this.pageNumber = null;
  }

  @action
  resetFilters() {
    this.pageNumber = null;
    this.fullName = null;
    this.certificability = [];
  }

  get certificabilityOptions() {
    return [
      {
        value: 'not-available',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.not-available'),
      },
      {
        value: 'eligible',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'),
      },
      {
        value: 'non-eligible',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.non-eligible'),
      },
    ];
  }
}
