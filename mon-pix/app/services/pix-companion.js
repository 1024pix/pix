import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PixCompanion extends Service {
  @tracked isExtensionEnabled = true;

  #checkExtensionIsEnabledInterval;

  startCertification(windowRef = window) {
    windowRef.dispatchEvent(new CustomEvent('pix:certification:start'));
    windowRef.postMessage({ event: 'pix:certification:start' }, windowRef.location.origin);
  }

  stopCertification(windowRef = window) {
    windowRef.dispatchEvent(new CustomEvent('pix:certification:stop'));
    windowRef.postMessage({ event: 'pix:certification:stop' }, windowRef.location.origin);
  }

  startCheckingExtensionIsEnabled() {
    this.checkExtensionIsEnabled();
    this.#checkExtensionIsEnabledInterval = setInterval(() => this.checkExtensionIsEnabled(), 1000);
  }

  stopCheckingExtensionIsEnabled() {
    clearInterval(this.#checkExtensionIsEnabledInterval);
  }

  checkExtensionIsEnabled(windowRef = window) {
    const pong = promiseWithResolverAndTimeout(100, windowRef);

    const pongListener = () => {
      pong.resolve();
    };

    windowRef.addEventListener('pix:companion:pong', pongListener, { once: true });

    pingCompanion(windowRef);

    pong.promise
      .then(() => {
        this.isExtensionEnabled = true;
      })
      .catch(() => {
        this.isExtensionEnabled = false;
        windowRef.removeEventListener('pix:companion:pong', pongListener);
      });
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
