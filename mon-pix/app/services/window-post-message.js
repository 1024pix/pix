import Service from '@ember/service';

export default class WindowPostMessage extends Service {
  #postMessage(...args) {
    return window.postMessage(...args);
  }

  startCertification(postMessage = this.#postMessage) {
    postMessage({ event: 'pix:certification:start' }, window.location.origin);
  }
}
