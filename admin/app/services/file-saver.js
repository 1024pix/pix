import Service from '@ember/service';
import FileSaver from 'file-saver';

export default class FileSaverService extends Service {

  saveAs(content, name) {
    const file = new File([content], name, { type: 'text/csv;charset=utf-8' });
    FileSaver.saveAs(file);
  }
}
