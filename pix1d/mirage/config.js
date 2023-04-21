export default function () {
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api/pix1d';
  this.timing = 0; // response delay

  this.get('/missions/:mission_id', (schema, request) => {
    return schema.missions.find(request.params.mission_id);
  });

  this.post('/assessments', (schema, request) => {
    const params = JSON.parse(request.requestBody);
    return schema.assessments.create({ missionId: params.missionId, type: 'PIX1D_MISSION' });
  });

  this.get('/assessments/:assessment_id', (schema, request) => {
    return schema.assessments.find(request.params.assessment_id);
  });

  this.get('/assessments/:assessment_id/next', (schema) => {
    return schema.challenges.find(1);
  });
}
