import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ModulixNavigationProgress extends Service {
  @tracked currentSectionIndex = 0;
  @tracked isBookModalOpen = false;

  openBookModal() {
    this.isBookModalOpen = true;
  }

  closeBookModal() {
    this.isBookModalOpen = false;
  }

  setCurrentSectionIndex(currentSectionIndex) {
    if (currentSectionIndex < 0) {
      this.currentSectionIndex = 0;
      return;
    }
    this.currentSectionIndex = currentSectionIndex;
  }

  determineCurrentSection(enrichedSections, currentGrain) {
    const currentSection = enrichedSections.find((section) => section.lastGrainId === currentGrain.id);

    if (currentSection) {
      const currentSectionIndex = currentSection.sectionIndex;

      if (currentSectionIndex < enrichedSections.length - 1) {
        this.setCurrentSectionIndex(currentSectionIndex + 1);
      }
    }
  }
}
