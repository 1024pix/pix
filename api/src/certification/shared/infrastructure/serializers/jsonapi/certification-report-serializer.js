import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

import { CertificationReport } from '../../../domain/models/CertificationReport.js';

function serialize(certificationReports) {
  return new Serializer('certification-report', {
    attributes: [
      'certificationCourseId',
      'firstName',
      'lastName',
      'examinerComment',
      'certificationIssueReports',
      'isCompleted',
      'abortReason',
    ],
    certificationIssueReports: {
      ref: 'id',
      attributes: ['category', 'description', 'subcategory', 'questionNumber'],
    },
  }).serialize(certificationReports);
}

async function deserialize(jsonApiData) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  const deserializedReport = await deserializer.deserialize(jsonApiData);
  return new CertificationReport(deserializedReport);
}

export const certificationReportSerializer = { deserialize, serialize };
