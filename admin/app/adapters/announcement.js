import ApplicationAdapter from './application';

export default class AnnouncementAdapter extends ApplicationAdapter {
  urlForUpdateRecord(id) {
    return `${this.host}/${this.namespace}/announcements/${id}`;
  }
}
