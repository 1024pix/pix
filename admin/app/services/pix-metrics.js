import Service, { service } from '@ember/service';

export default class PixMetricsService extends Service {
  @service metrics;
  @service router;

  trackEvent(eventName, { disabled, ...props } = {}) {
    if (disabled) return;
    const url = this.getRedactedPageUrl();
    this.metrics.trackEvent({ eventName, plausibleAttributes: { u: url }, ...props });
  }

  trackPage(props) {
    const url = this.getRedactedPageUrl();
    this.metrics.trackPage({ plausibleAttributes: { u: url }, ...props });
  }

  getRedactedPageUrl() {
    const params = extractParamsFromRouteInfo(this.router.currentRoute);
    const currentUrl = this.router.currentURL;
    if (!currentUrl) return null;

    const [base, queryParams] = currentUrl.split('?');
    if (!base) return null;

    const redactedUrl = base
      .split('/')
      .map((token) => {
        return params.includes(token) ? '_ID_' : token;
      })
      .join('/');
    const baseUrl = new URL(window.location).origin;
    return queryParams ? `${baseUrl}${redactedUrl}?${queryParams}` : `${baseUrl}${redactedUrl}`;
  }
}

const extractParamsFromRouteInfo = (routeInfo = {}, params = []) =>
  routeInfo?.parent
    ? extractParamsFromRouteInfo(routeInfo.parent, params.concat(Object.values(routeInfo.params)))
    : params;
