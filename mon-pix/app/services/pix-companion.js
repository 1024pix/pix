import Service from '@ember/service';

export default class PixCompanion extends Service {
  startCertification(windowRef = window) {
    windowRef.dispatchEvent(new CustomEvent('pix:certification:start'));
    windowRef.postMessage({ event: 'pix:certification:start' }, windowRef.location.origin);
  }

  stopCertification(windowRef = window) {
    windowRef.dispatchEvent(new CustomEvent('pix:certification:stop'));
    windowRef.postMessage({ event: 'pix:certification:stop' }, windowRef.location.origin);
  }
}
