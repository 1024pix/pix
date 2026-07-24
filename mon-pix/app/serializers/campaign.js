import { JSONAPISerializer } from '@warp-drive/legacy/serializer/json-api';

export default class CampaignSerializer extends JSONAPISerializer {
  attrs = {
    organizationFormNPSUrl: {
      key: 'organization-form-nps-url',
    },
  };
}
