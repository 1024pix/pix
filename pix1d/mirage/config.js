export default function () {
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api';
  this.timing = 0; // response delay

  this.get('/challenges/:challenge_number', (schema, request) => {
    return schema.challenges.find(request.params.challenge_number);
  });
}
