import ApplicationSerializer from './application';

export default class OrganizationImportDetailSerializer extends ApplicationSerializer {
  attrs = {
    importErrors: 'errors',
  };
}
