export default function () {
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api/pix1d';
  this.timing = 0; // response delay

  this.get('/challenges/:challenge_id', (schema, request) => {
    return schema.challenges.find(request.params.challenge_id);
  });
}
