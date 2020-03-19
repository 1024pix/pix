export default function index(config) {
  config.post('/student-dependent-users', (schema, request) => {
    const params = JSON.parse(request.requestBody);

    const campaignCode = params.data.attributes['campaign-code'];
    const organizationId = schema.campaigns.findBy({ code: campaignCode }).organizationId;

    const firstName = params.data.attributes['first-name'];
    const lastName = params.data.attributes['last-name'];
    const newUser = {
      firstName,
      lastName,
      email: params.data.attributes['email'],
      username: params.data.attributes['username'],
      password: params.data.attributes['password'],
    };
    const student = schema.students.findBy({ firstName, lastName });
    const user = schema.users.create(newUser);
    student.update({ userId: user.id, organizationId });
    return user;
  });
}
