import { Factory } from 'miragejs';

export default Factory.extend({
  afterCreate(certificationVersionSummary, server) {
    server.create('certification-version', {
      id: certificationVersionSummary.id,
      scope: certificationVersionSummary.scope,
      startDate: certificationVersionSummary.startDate,
      expirationDate: certificationVersionSummary.expirationDate,
      assessmentDuration: certificationVersionSummary.assessmentDuration,
      maximumAssessmentLength: certificationVersionSummary.maximumAssessmentLength,
      status: certificationVersionSummary.status,
    });
  },
});
