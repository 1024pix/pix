export const updateAnnouncement = ({ name, content, announcementRepository }) =>
  announcementRepository.update(name, content);
