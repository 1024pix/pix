import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';

export default class DownloadModal extends Component {
  @tracked
  fileName = 'profil-cible';

  get fileNameSuffix() {
    const date = dayjs().format('DD-MM-YYYY_HH-mm-ss');
    return `_${date}.json`;
  }

  get formattedFileSize() {
    return (this.downloadContent.size / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 }) + ' Ko';
  }

  get downloadContent() {
    const json = JSON.stringify(this.args.tubesWithLevelAndSkills);
    return new Blob([json], { type: 'application/json' });
  }

  get downloadURL() {
    return URL.createObjectURL(this.downloadContent);
  }

  @action
  onFileNameChange(event) {
    this.fileName = event.target.value;
  }
}
