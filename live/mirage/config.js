export default function () {
}

export function testConfig() {

  const AIRTABLE_ROOT = 'https://api.airtable.com/v0';
  const AIRTABLE_DATABASE = 'appHAIFk9u1qqglhX';

  this.get(`${AIRTABLE_ROOT}/${AIRTABLE_DATABASE}/Tests`, function (schema) {
    return schema.courseAirtables.all();
  });

  this.get(`${AIRTABLE_ROOT}/${AIRTABLE_DATABASE}/Tests/:id`, function (schema, request) {
    return schema.courseAirtables.find(request.params.id);
  });

  this.get(`${AIRTABLE_ROOT}/${AIRTABLE_DATABASE}/Epreuves/:id`, function (schema, request) {
    return schema.challengeAirtables.find(request.params.id);
  });

  this.get(`${AIRTABLE_ROOT}/${AIRTABLE_DATABASE}/Evaluations/:id`, function (schema, request) {
    return schema.assessmentAirtables.find(request.params.id);
  });

  this.post(`${AIRTABLE_ROOT}/${AIRTABLE_DATABASE}/Evaluations`, function (schema) {
    return schema.assessmentAirtables.all();
  });

  this.post(`${AIRTABLE_ROOT}/${AIRTABLE_DATABASE}/Reponses`, function (schema) {
    return schema.answerAirtables.all();
  });

  this.get(`${AIRTABLE_ROOT}/${AIRTABLE_DATABASE}/Reponses/:id`, function (schema, request) {
    return schema.answerAirtables.find(request.params.id);
  });

}
