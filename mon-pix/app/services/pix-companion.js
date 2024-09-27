import Service from '@ember/service';

export default class PixCompanion extends Service {
  #postMessage(...args) {
    return window.postMessage(...args);
  }

  startCertification(postMessage = this.#postMessage) {
    postMessage({ event: 'pix:certification:start' }, window.location.origin);
  }

  stopCertification(postMessage = this.#postMessage) {
    postMessage({ event: 'pix:certification:stop' }, window.location.origin);
  }
}
