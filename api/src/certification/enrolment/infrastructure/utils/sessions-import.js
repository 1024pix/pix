import { generateCSVTemplate } from '../../../../shared/infrastructure/serializers/csv/csv-template.js';
import {
  COMPLEMENTARY_CERTIFICATION_SUFFIX,
  headers,
} from '../../../shared/infrastructure/utils/csv/sessions-import.js';

async function getCsvHeaders({ habilitationLabels, shouldDisplayBillingModeColumns = true }) {
  const complementaryCertificationsHeaders = _getComplementaryCertificationsHeaders(habilitationLabels);
  const fields = _getHeadersAsArray(complementaryCertificationsHeaders, shouldDisplayBillingModeColumns);
  return generateCSVTemplate(fields);
}

function _getComplementaryCertificationsHeaders(habilitationLabels) {
  return habilitationLabels?.map((habilitationLabel) => `${habilitationLabel} ${COMPLEMENTARY_CERTIFICATION_SUFFIX}`);
}

function _getHeadersAsArray(complementaryCertificationsHeaders = [], shouldDisplayBillingModeColumns) {
  // eslint-disable-next-line no-unused-vars
  const { billingMode, prepaymentCode, ...headersWithoutBillingMode } = headers;
  const certificationCenterCsvHeaders = shouldDisplayBillingModeColumns ? headers : headersWithoutBillingMode;

  const csvHeaders = Object.keys(certificationCenterCsvHeaders).reduce((arr, key) => [...arr, headers[key]], []);
  return [...csvHeaders, ...complementaryCertificationsHeaders];
}

export { getCsvHeaders };
