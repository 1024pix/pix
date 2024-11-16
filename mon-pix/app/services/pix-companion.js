import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const MINIMAL_VERSION_FOR_CERTIFICATION_SESSION = [0, 0, 5];

export default class PixCompanion extends Service {
  @service featureToggles;
  @tracked _isExtensionEnabled = true;
  @tracked version = null;

  #checkExtensionIsEnabledInterval;
  #eventTarget = new EventTarget();

  startCertification(windowRef = window) {
    if (!this.featureToggles.featureToggles.isPixCompanionEnabled) return;
    windowRef.dispatchEvent(new CustomEvent('pix:certification:start'));
    windowRef.postMessage({ event: 'pix:certification:start' }, windowRef.location.origin);
  }

  stopCertification(windowRef = window) {
    if (!this.featureToggles.featureToggles.isPixCompanionEnabled) return;
    windowRef.dispatchEvent(new CustomEvent('pix:certification:stop'));
    windowRef.postMessage({ event: 'pix:certification:stop' }, windowRef.location.origin);
  }

  startCheckingExtensionIsEnabled(windowRef = window) {
    if (!this.featureToggles.featureToggles.isPixCompanionEnabled) return;
    this.checkExtensionIsEnabled(windowRef);
    this.#checkExtensionIsEnabledInterval = windowRef.setInterval(() => this.checkExtensionIsEnabled(windowRef), 1000);
  }

  stopCheckingExtensionIsEnabled(windowRef = window) {
    if (!this.featureToggles.featureToggles.isPixCompanionEnabled) return;
    windowRef.clearInterval(this.#checkExtensionIsEnabledInterval);
  }

  checkExtensionIsEnabled(windowRef = window) {
    const pong = promiseWithResolverAndTimeout(100, windowRef);
    const pongListener = (event) => {
      try {
        this.version = event.detail?.version;
      } catch {} // eslint-disable-line no-empty
      pong.resolve();
    };

    windowRef.addEventListener('pix:companion:pong', pongListener, { once: true });

    pingCompanion(windowRef);

    pong.promise
      .then(() => {
        this._isExtensionEnabled = true;
      })
      .catch(() => {
        if (this._isExtensionEnabled) {
          this.#eventTarget.dispatchEvent(new CustomEvent('block'));
        }
        this._isExtensionEnabled = false;
        windowRef.removeEventListener('pix:companion:pong', pongListener);
      });
  }

  /**
   * @type EventTarget['addEventListener']
   */
  addEventListener(...args) {
    this.#eventTarget.addEventListener(...args);
  }

  /**
   * @type EventTarget['removeEventListener']
   */
  removeEventListener(...args) {
    this.#eventTarget.removeEventListener(...args);
  }

  get isExtensionEnabled() {
    if (!this.featureToggles.featureToggles.isPixCompanionEnabled) return true;
    return this._isExtensionEnabled;
  }

  get hasMinimalVersionForCertification() {
    if (!this._isExtensionEnabled) return false;
    if (!this.version) return true;
    const version = this.version.split('.').map((n) => parseInt(n));
    for (let i = 0; i < 3; i++) {
      if (version[i] < MINIMAL_VERSION_FOR_CERTIFICATION_SESSION[i]) return false;
      if (version[i] > MINIMAL_VERSION_FOR_CERTIFICATION_SESSION[i]) return true;
    }
    return true;
  }
}

function pingCompanion(windowRef = window) {
  windowRef.dispatchEvent(new CustomEvent('pix:companion:ping'));
}

/**
 * Creates a promise which can be resolved by calling the returned resolve function
 * or will reject after the given timeout.
 *
 * @param {number} timeout
 * @returns {{
 *   promise: Promise
 *   resolve: (value: any) => void
 * }}
 */
function promiseWithResolverAndTimeout(timeout, windowRef = window) {
  let resolve;
  const promise = new Promise((pResolve, reject) => {
    resolve = pResolve;
    windowRef.setTimeout(() => {
      reject(new Error(`promise did not resolve after ${timeout}ms`));
    }, timeout);
  });
  return { promise, resolve };
}
