import AirtableSerializer from "./airtable-serializer";

export default AirtableSerializer.extend({

  transformFields(fields) {
    const result = {
      instruction: fields['Consigne'],
      proposals: fields['Propositions'],
      type: fields["Type d'épreuve"]
    };

    if (fields['Illustration de la consigne']) {
      result.illustrationUrl = fields['Illustration de la consigne'][0].url;
    }

    if (fields['Pièce jointe']) {
      const { url, filename } = fields['Pièce jointe'][0];
      result.attachmentUrl = url;
      result.attachmentFilename = filename;
    }

    return result;
  }
});
