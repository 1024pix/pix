export default function () {
  this.passthrough('https://api.airtable.com/**');
}

export function testConfig() {

  const AIRTABLE_ROOT = 'https://api.airtable.com/v0';
  const AIRTABLE_TABLE = 'appHAIFk9u1qqglhX';

  this.get(`${AIRTABLE_ROOT}/${AIRTABLE_TABLE}/Tests`, function (schema) {
    return schema.courseAirtables.all();
  });

  this.get(`${AIRTABLE_ROOT}/${AIRTABLE_TABLE}/Tests/:id`, function (schema, request) {
    return schema.courseAirtables.find(request.params.id);
  });

  this.get(`${AIRTABLE_ROOT}/${AIRTABLE_TABLE}/Epreuves/:id`, function (schema, request) {
    return schema.challengeAirtables.find(request.params.id);
  });

  this.get(`${AIRTABLE_ROOT}/${AIRTABLE_TABLE}/Evaluations/:id`, function (schema, request) {
    return schema.assessmentAirtables.find(request.params.id);
  });

  this.post(`${AIRTABLE_ROOT}/${AIRTABLE_TABLE}/Evaluations`, function (schema) {
    return schema.assessmentAirtables.all();
  });

}
