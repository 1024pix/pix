import { Response } from 'ember-cli-mirage';

export default function overrideApiResponse(status, responseBody) {
  return new Response(status,{ 'content-type': 'application/json; charset=utf-8' }, responseBody);
}
