import ApplicationAdapter from './application';

export default class CertificationCourse extends ApplicationAdapter {
  get headers() {
    const existingHeaders = super.headers;
    existingHeaders['x-timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return existingHeaders;
  }
}
