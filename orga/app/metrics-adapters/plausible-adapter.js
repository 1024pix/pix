import BaseAdapter from 'ember-metrics/metrics-adapters/base';

export default class PlausibleAdapter extends BaseAdapter {
  toStringExtension() {
    return PlausibleAdapter.name;
  }

  install() {
    const { scriptUrl } = this.config;

    window.plausible =
      window.plausible ||
      function () {
        (window.plausible.q = window.plausible.q || []).push(arguments);
      };

    window.plausible.init =
      window.plausible.init ||
      function (i) {
        window.plausible.o = i || {};
      };

    window.plausible.init({
      hashBasedRouting: true,
      autoCapturePageviews: false,
      captureOnLocalhost: true,
    });

    const scriptElement = document.createElement('script');
    const firstScriptElement = document.getElementsByTagName('script')[0];
    scriptElement.type = 'text/javascript';
    scriptElement.async = true;
    scriptElement.src = scriptUrl;
    firstScriptElement.parentNode.insertBefore(scriptElement, firstScriptElement);
  }

  identify() {}

  /**
   * Custom events allow you to measure button clicks, form completions...
   *
   * @param {Object} params
   * @param {string} params.eventName - must not contain spaces, examples: verify-this or That+Completion
   * @param {Objects} params.props - event metadatas, must not contain any personally identifiable information
   */
  trackEvent({ eventName, plausibleAttributes = {}, ...props }) {
    window.plausible(eventName, { ...plausibleAttributes, props });
  }

  trackPage({ plausibleAttributes = {}, ...props }) {
    window.plausible('pageview', { ...plausibleAttributes, props });
  }

  alias() {}

  uninstall() {
    document.querySelectorAll('script[src*="plausible"]').forEach((el) => {
      el.parentElement?.removeChild(el);
    });
    delete window.plausible;
  }
}
