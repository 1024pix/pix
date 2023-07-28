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

  this.post('/activity-answers', (schema, request) => {
    const answerValue = JSON.parse(request.requestBody).data.attributes?.value;
    return schema.create('activity-answer', {
      result: answerValue === '#ABAND#' ? 'aband' : answerValue !== 'bad-answer' ? 'ok' : 'ko',
    });
  });

  this.get('/challenges/:challenge_id', (schema, request) => {
    return schema.challenges.find(request.params.challenge_id);
  });
}
