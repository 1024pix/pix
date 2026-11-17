import Helper from '@ember/component/helper';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';

const COLUMN_KEY_FIELD: Record<string, string> = {
  COMMON_BIRTHDATE: 'common.import.field.birthdate',
  COMMON_DIVISION: 'common.import.field.division',
  ORALIZATION: 'common.import.field.oralization',
};

interface GetExtraColumnLabelSignature {
  Args: {
    Positional: [heading: string];
  };
  Return: string;
}

export default class GetExtraColumnLabel extends Helper<GetExtraColumnLabelSignature> {
  @service declare intl: IntlService;

  compute([heading]: [string]): string {
    const translationKey = COLUMN_KEY_FIELD[heading];

    return translationKey ? this.intl.t(translationKey) : heading;
  }
}
