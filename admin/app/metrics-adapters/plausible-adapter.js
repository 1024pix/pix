import BaseAdapter from 'ember-metrics/metrics-adapters/base';

export default class PlausibleAdapter extends BaseAdapter {
  toStringExtension() {
    return PlausibleAdapter.name;
  }

  install() {
    const { siteId, scriptUrl } = this.config;

    window.plausible =
      window.plausible ||
      function (...args) {
        (window.plausible.q = window.plausible.q || []).push(args);
      };

    const scriptElement = document.createElement('script');
    const firstScriptElement = document.getElementsByTagName('script')[0];
    scriptElement.type = 'text/javascript';
    scriptElement.defer = true;
    scriptElement.async = true;
    scriptElement.src = scriptUrl;
    scriptElement.setAttribute('data-domain', siteId);
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
