import Service from '@ember/service';
import XLSX from 'xlsx';

export default Service.extend({

  async extractJSONDataFromODSFileIgnoringHeader(ODSFile, header) {
    const arrayBuffer = await ODSFile.readAsArrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array', cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const headerRowsNumber = 8;
    return XLSX.utils.sheet_to_json(worksheet, { range: headerRowsNumber, header });
  }
});
