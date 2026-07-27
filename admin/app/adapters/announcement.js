import ApplicationAdapter from './application';

export default class AnnouncementAdapter extends ApplicationAdapter {
  urlForFindRecord(id) {
    return `${this.host}/api/announcements/${id}`;
  }

  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/announcements/${id}`;
  }
}
