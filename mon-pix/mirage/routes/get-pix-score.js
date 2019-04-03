export default function(schema, request) {
  const userId = request.params.id;

  return {
    data: {
      type: 'pix-score',
      id: userId,
      attributes: {
        value: 196
      }
    }
  };
}
