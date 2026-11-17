import { Response } from 'miragejs';

export default function (schema, request) {
  const { code } = request.params;

  const verifiedCode = schema.verifiedCodes.find(code);

  return verifiedCode ? verifiedCode : new Response(404);
}
