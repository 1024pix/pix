import Service from '@ember/service';
import { isTesting } from '@embroider/macros';
import { tracked } from '@glimmer/tracking';
import breakpoints from 'mon-pix/breakpoints';

export default class MediaService extends Service {
  // Tests default to desktop regardless of the browser window size, override with false to use window.matchMedia
  static mocked = isTesting();

  @tracked isMobile = false;
  @tracked isTablet = false;
  @tracked isDesktop = true;

  #unwatchers = [];

  constructor() {
    super(...arguments);
    if (this.constructor.mocked) return;

    this.#watch('isMobile', breakpoints.mobile);
    this.#watch('isTablet', breakpoints.tablet);
    this.#watch('isDesktop', breakpoints.desktop);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.#unwatchers.forEach((unwatch) => unwatch());
  }

  #watch(property, query) {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event) => (this[property] = event.matches);
    this[property] = mediaQueryList.matches;
    mediaQueryList.addEventListener('change', listener);
    this.#unwatchers.push(() => mediaQueryList.removeEventListener('change', listener));
  }
}
