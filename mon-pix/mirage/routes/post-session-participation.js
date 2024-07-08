import every from 'lodash/every';
import { Response } from 'miragejs';

export default function (schema, request) {
  const params = JSON.parse(request.requestBody);
  const sessionId = request.params.id;
  const firstName = params.data.attributes['first-name'];
  const lastName = params.data.attributes['last-name'];
  const birthdate = params.data.attributes['birthdate'];
  let hasSeenCertificationInstructions = false;
  if (!every([firstName, lastName, birthdate, sessionId])) {
    return new Response(400);
  }
  if (lastName === 'hasSeenCertificationInstructions') {
    hasSeenCertificationInstructions = true;
  }
  if (lastName === 'PasInscrite') {
    return new Response(404);
  }
  if (lastName === 'PlusieursMatchs') {
    return new Response(409);
  }
  if (lastName === 'UtilisateurLiéAutre') {
    return new Response(403);
  }
  if (lastName === 'CandidatLiéAutre') {
    return new Response(403);
  }
  if (lastName === 'CandidatLiéUtilisateur') {
    return schema.certificationCandidates.find(1);
  }

  return schema.certificationCandidates.create({
    id: 2,
    firstName: 'Laura',
    lastName: 'Bravo',
    sessionId: 1,
    birthdate: '1990-01-04',
    hasSeenCertificationInstructions,
  });
}
