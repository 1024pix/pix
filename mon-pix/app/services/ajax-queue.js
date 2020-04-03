import Service from '@ember/service';
import { default as PQueue } from 'p-queue';
import ENV from 'mon-pix/config/environment';

export default class AjaxQueueService extends Service {

  constructor() {
    super(...arguments);
    this._queue = new PQueue({ concurrency: ENV.APP.MAX_CONCURRENT_AJAX_CALLS });
  }

  async add(job) {
    return this._queue.add(job);
  }
}
