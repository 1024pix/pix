import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import AdministrationBlockLayout from '../block-layout';
import DateEditor from './date-editor';

export default class ScoBlockedAccessDates extends Component {
  @service store;
  @service intl;
  @service router;
  @service pixToast;

  get collegeDate() {
    return this.args.scoBlockedAccessDates?.find((date) => date.id === 'COLLEGE');
  }

  get lyceeDate() {
    return this.args.scoBlockedAccessDates?.find((date) => date.id === 'LYCEE');
  }

  @action
  async saveDate(scoOrganizationTagName, dateInput) {
    const adapter = this.store.adapterFor('sco-blocked-access-date');
    try {
      await adapter.updateRecord(scoOrganizationTagName, dateInput);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.administration.sco-deployment.sco-blocked-access-date.success'),
      });
      await this.router.refresh();
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('pages.administration.sco-deployment.sco-blocked-access-date.error'),
      });
    }
  }

  @action
  saveLyceeDate(dateInput) {
    return this.saveDate('LYCEE', dateInput);
  }

  @action
  saveCollegeDate(dateInput) {
    return this.saveDate('COLLEGE', dateInput);
  }

  <template>
    <AdministrationBlockLayout
      @title={{t "pages.administration.sco-deployment.sco-blocked-access-date.title"}}
      class="sco-blocked-access-date-configuration"
    >
      <DateEditor
        @date={{this.lyceeDate}}
        @label={{t "pages.administration.sco-deployment.sco-blocked-access-date.high-school-date"}}
        @onSave={{this.saveLyceeDate}}
      />
      <DateEditor
        @date={{this.collegeDate}}
        @label={{t "pages.administration.sco-deployment.sco-blocked-access-date.middle-school-date"}}
        @onSave={{this.saveCollegeDate}}
      />
    </AdministrationBlockLayout>
  </template>
}
