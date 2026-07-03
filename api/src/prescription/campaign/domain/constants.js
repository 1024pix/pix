import { config } from '../../../shared/config.js';
import { CsvColumn } from '../../../shared/infrastructure/serializers/csv/csv-column.js';
import { CampaignExternalIdTypes, CampaignTypes } from '../../shared/domain/constants.js';

export const CAMPAIGNS_HEADER = {
  columns: [
    new CsvColumn({
      property: 'organizationId',
      name: `Identifiant de l'organisation*`,
      isInteger: true,
      isRequired: true,
    }),
    new CsvColumn({
      property: 'name',
      name: 'Nom de la campagne*',
      isRequired: true,
    }),
    new CsvColumn({
      property: 'targetProfileId',
      name: 'Identifiant du profil cible*',
      isRequired: true,
      isInteger: true,
    }),
    new CsvColumn({
      property: 'ownerId',
      name: 'Identifiant du propriétaire*',
      isRequired: true,
      isInteger: true,
    }),
    new CsvColumn({
      property: 'creatorId',
      name: 'Identifiant du créateur*',
      isRequired: true,
      isInteger: true,
    }),
    new CsvColumn({
      property: 'externalIdLabel',
      name: `Libellé de l'identifiant externe`,
      isRequired: false,
    }),
    new CsvColumn({
      property: 'externalIdType',
      name: `Type de l'identifiant externe`,
      acceptedValues: ['email', 'text', CampaignExternalIdTypes.EMAIL, CampaignExternalIdTypes.STRING],
      transformValues: {
        email: CampaignExternalIdTypes.EMAIL,
        text: CampaignExternalIdTypes.STRING,
      },
      isRequired: false,
    }),
    new CsvColumn({
      property: 'type',
      name: 'Type de campagne (Evaluation, Examen)',
      acceptedValues: ['Evaluation', 'Examen', CampaignTypes.ASSESSMENT, CampaignTypes.EXAM],
      transformValues: {
        Evaluation: CampaignTypes.ASSESSMENT,
        Examen: CampaignTypes.EXAM,
      },
      isRequired: false,
    }),
    new CsvColumn({
      property: 'title',
      name: 'Titre du parcours',
      isRequired: false,
    }),
    new CsvColumn({
      property: 'customLandingPageText',
      name: 'Descriptif du parcours',
      isRequired: false,
    }),
    new CsvColumn({
      property: 'multipleSendings',
      name: 'Envoi multiple',
      isRequired: false,
      acceptedValues: ['Oui', 'Non'],
      transformValues: {
        Oui: true,
        Non: false,
      },
    }),
    new CsvColumn({
      property: 'customResultPageText',
      name: 'Texte de la page de fin de parcours',
      isRequired: false,
    }),
    new CsvColumn({
      property: 'customResultPageButtonText',
      name: 'Texte du bouton de la page de fin de parcours',
      isRequired: false,
    }),
    new CsvColumn({
      property: 'customResultPageButtonUrl',
      name: 'URL du bouton de la page de fin de parcours',
      isRequired: false,
    }),
  ],
};

export const CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING = config.infra.chunkSizeForCampaignResultProcessing;
