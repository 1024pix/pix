import { readFile } from 'node:fs/promises';
import * as url from 'node:url';

import Joi from 'joi';
import { PDFDocument, rgb } from 'pdf-lib';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { identifiersType } from '../../../shared/domain/types/identifiers-type.js';
import { userController } from './user-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/attestation',
      config: {
        auth: false,
        handler: async function (request, h) {
          const template = await readFile(`${__dirname}/template.pdf`);
          const pdfDoc = await PDFDocument.load(template);

          const form = pdfDoc.getForm();

          const field = form.getTextField('fullName');
          field.setText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras nec.');
          field.enableReadOnly();

          const buffer = Buffer.from(await pdfDoc.save());
          const fileName = 'mon-attestation.pdf';

          return h
            .response(buffer)
            .header('Content-Disposition', `attachment; filename=${fileName}`)
            .header('Content-Type', 'application/pdf');
        },
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Sauvegarde le fait que l'utilisateur ait vu le message d'information d'ouverture du niveau 7" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
          "- Le contenu de la requête n'est pas pris en compte.",
        ],
        tags: ['api', 'user'],
      },
    },
    {
      method: 'PATCH',
      path: '/api/users/{id}/user-has-seen-level-seven-info',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkRequestedUserIsAuthenticatedUser,
            assign: 'requestedUserIsAuthenticatedUser',
          },
        ],
        validate: {
          params: Joi.object({
            id: identifiersType.userId,
          }),
        },
        handler: userController.rememberUserHasSeenLevelSevenInfo,
        notes: [
          '- **Cette route est restreinte aux utilisateurs authentifiés**\n' +
            "- Sauvegarde le fait que l'utilisateur ait vu le message d'information d'ouverture du niveau 7" +
            '- L’id demandé doit correspondre à celui de l’utilisateur authentifié',
          "- Le contenu de la requête n'est pas pris en compte.",
        ],
        tags: ['api', 'user'],
      },
    },
  ]);
};

const name = 'evaluation-users-api';
export { name, register };
