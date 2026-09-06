import { describe, expect, it } from 'vitest';
import { exerciseSectionById, exerciseSections, isSectionId } from './learningContent';

describe('learningContent lesson data', () => {
  it('contains only unique section IDs', () => {
    const sectionIds = exerciseSections.map((section) => section.id);

    expect(new Set(sectionIds).size).toBe(sectionIds.length);
  });

  it('contains valid required content for every section', () => {
    exerciseSections.forEach((section) => {
      expect(section.title.trim()).not.toBe('');
      expect(section.description.trim()).not.toBe('');
      expect(section.videoUrl.trim()).not.toBe('');
      expect(section.thumbnailUrl.trim()).not.toBe('');
      expect(Number.isFinite(section.requiredTrainingMs)).toBe(true);
      expect(section.requiredTrainingMs).toBeGreaterThan(0);
    });
  });

  it('references an existing section from every non-null nextSectionId', () => {
    const sectionIds = new Set(exerciseSections.map((section) => section.id));

    exerciseSections.forEach((section) => {
      if (section.nextSectionId !== null) {
        expect(sectionIds.has(section.nextSectionId)).toBe(true);
      }
    });
  });

  it('sets nextSectionId to null on the last section', () => {
    expect(exerciseSections.at(-1)?.nextSectionId).toBeNull();
  });
});

describe('exerciseSectionById', () => {
  it('returns the corresponding section for every ID', () => {
    exerciseSections.forEach((section) => {
      expect(exerciseSectionById[section.id]).toBe(section);
    });
  });
});

describe('isSectionId', () => {
  it('returns true for every existing section ID', () => {
    exerciseSections.forEach((section) => {
      expect(isSectionId(section.id)).toBe(true);
    });
  });

  it.each(['', 'unknown-section', 'toString'])('returns false for the invalid value "%s"', (value) => {
    expect(isSectionId(value)).toBe(false);
  });
});
