import { randomUUID } from 'node:crypto';

export function getVideoSample() {
  return {
    id: randomUUID(),
    type: 'video',
    title: 'Une vidéo',
    url: 'https://videos.pix.fr/modulix/placeholder-video.mp4',
    subtitles: 'https://videos.pix.fr/modulix/placeholder-video.vtt',
    transcription: '<p>Vidéo manquante</p>',
  };
}
