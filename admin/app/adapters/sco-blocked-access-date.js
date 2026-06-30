import ApplicationAdapter from './application';

export default class ScoBlockedAccessDatesAdapter extends ApplicationAdapter {
  urlForFindAll() {
    return `${this.host}/${this.namespace}/sco-blocked-access-dates`;
  }

  updateRecord(scoOrganizationTagName, reopeningDate) {
    const url = `${this.host}/${this.namespace}/sco-blocked-access-dates/${scoOrganizationTagName}`;
    const payload = {
      data: {
        attributes: {
          value: reopeningDate,
        },
      },
    };
    return this.ajax(url, 'PATCH', { data: payload });
  }
}
