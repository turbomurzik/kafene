import {
  isVisibleSection,
  type LocalizedSectionLike,
} from './localized-section-semantics.js'

export type LocalizedDocumentLike<TSection extends LocalizedSectionLike = LocalizedSectionLike> = {
  sections?: readonly TSection[] | null
}

export function projectVisibleSections<TSection extends LocalizedSectionLike>(
  sections: readonly TSection[] | null | undefined,
): TSection[] {
  if (!Array.isArray(sections)) return []
  return sections.filter((section) => isVisibleSection(section))
}

export function projectLocalizedDocument<
  TSection extends LocalizedSectionLike,
  TDocument extends LocalizedDocumentLike<TSection>,
>(document: TDocument): TDocument & { sections: TSection[] } {
  return {
    ...document,
    sections: projectVisibleSections(document.sections),
  }
}
