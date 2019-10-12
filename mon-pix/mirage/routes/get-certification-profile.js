export default function(schema, request) {
  const userId = request.params.id;

  return {
    data: {
      type: 'certification-profile',
      id: userId,
      attributes: {
        'is-certifiable': true,
      }
    }
  };
}
