import { BadRequestError } from '../../application/errors/http-errors.js';

const PIX_APP_APPLICATION_NAME = 'app';
const PIX_ADMIN_APPLICATION_NAME = 'admin';
const PIX_ORGA_APPLICATION_NAME = 'orga';
const PIX_CERTIF_APPLICATION_NAME = 'certif';
const PIX_JUNIOR_APPLICATION_NAME = 'junior';

export const VALID_APPLICATIONS = [
  PIX_APP_APPLICATION_NAME,
  PIX_ADMIN_APPLICATION_NAME,
  PIX_ORGA_APPLICATION_NAME,
  PIX_CERTIF_APPLICATION_NAME,
  PIX_JUNIOR_APPLICATION_NAME,
];

const localhostApplicationPortMapping = {
  4200: PIX_APP_APPLICATION_NAME,
  4201: PIX_ORGA_APPLICATION_NAME,
  4202: PIX_ADMIN_APPLICATION_NAME,
  4203: PIX_CERTIF_APPLICATION_NAME,
  4205: PIX_JUNIOR_APPLICATION_NAME,
};

/**
 * Returns the HTTP origin of the given HTTP request headers, based on the x-forwarded-proto and x-forwarded-host headers
 *
 * @param {Object} headers
 * @returns {string} an URL as a string
 */
export function getForwardedOrigin(headers) {
  const protoHeader = headers['x-forwarded-proto'];
  const hostHeader = headers['x-forwarded-host'];
  if (!protoHeader || !hostHeader) {
    throw new ForwardedOriginError('Missing forwarded header(s)');
  }

  return `${_getHeaderFirstValue(protoHeader)}://${_getHeaderFirstValue(hostHeader)}`;
}

export class RequestedApplication {
  /**
   * @param {Object} params
   * @param {string} params.applicationName
   * @param {string} params.applicationTld
   */
  constructor({ applicationName, applicationTld }) {
    this.applicationName = applicationName;
    this.applicationTld = applicationTld;
  }

  get isPixApp() {
    return this.applicationName == PIX_APP_APPLICATION_NAME;
  }

  get isPixAdmin() {
    return this.applicationName == PIX_ADMIN_APPLICATION_NAME;
  }

  get isPixOrga() {
    return this.applicationName == PIX_ORGA_APPLICATION_NAME;
  }

  get isPixCertif() {
    return this.applicationName == PIX_CERTIF_APPLICATION_NAME;
  }

  get isPixJunior() {
    return this.applicationName == PIX_JUNIOR_APPLICATION_NAME;
  }

  /**
   * @param {string} origin an URL like https://app.pix.fr, https://orga.pix.fr, https://app-pr10823.review.pix.fr, http://localhost:4200, etc.
   * @returns {RequestedApplication}
   */
  static fromOrigin(origin) {
    let url;
    try {
      url = new URL(origin);
    } catch {
      throw new ForwardedOriginError(`Invalid URL: "${origin}"`);
    }

    let applicationName;
    let applicationTld;

    if (url.hostname == 'localhost') {
      applicationName = localhostApplicationPortMapping[url.port];
      applicationTld = '';
      return new RequestedApplication({ applicationName, applicationTld });
    }

    const hostnameParts = url.hostname.split('.');
    if (hostnameParts.length < 2) {
      throw new ForwardedOriginError(`Unsupported hostname: "${url.hostname}"`);
    }

    const urlFirstLabel = hostnameParts[0];
    applicationTld = `.${hostnameParts.at(-1)}`;

    const urlFirstLabelParts = urlFirstLabel.split('-');
    if (urlFirstLabelParts.length == 2) {
      const reviewAppSubPart = urlFirstLabelParts[0];
      applicationName = reviewAppSubPart;
    } else {
      applicationName = urlFirstLabel;
    }

    return new RequestedApplication({ applicationName, applicationTld });
  }
}

export class ForwardedOriginError extends BadRequestError {
  constructor(message) {
    super(message);
  }
}

function _getHeaderFirstValue(headerValue) {
  return headerValue.split(',')[0];
}
