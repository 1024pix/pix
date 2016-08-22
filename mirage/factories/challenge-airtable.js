import { faker } from 'ember-cli-mirage';
import AirtableFactory from './airtable-record';

export default AirtableFactory.extend({
  fields: {
    Consigne: faker.lorem.paragraphs(2),
    "Propositions QCU / QCM": "",
    "Type d'épreuve": faker.list.cycle('QCU', 'QCM', 'QROC')
  }
});
