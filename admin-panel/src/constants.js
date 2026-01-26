export const ROLES = {
    // Standardizing roles. DB typically stores 'content_inputter' or 'ingestor'.
    // We'll treat them equavalently in logic if needed, but here define the canonical versions.
    INGESTOR: 'content_inputter',
    SUB_EDITOR: 'sub_editor',
    SENIOR_EDITOR: 'senior_editor',
    LEGAL: 'legal',
    PUBLISHER: 'publisher',
    ADMIN: 'admin'
};

export const STATUS = {
    DRAFT: 'draft',
    SUB_EDITOR_REVIEW: 'sub_editor_review',
    SENIOR_EDITOR_REVIEW: 'senior_editor_review',
    LEGAL_REVIEW: 'legal_review',
    PUBLISHER_REVIEW: 'publisher_review',
    PUBLISHED: 'published',
    REJECTED: 'rejected',
    REJECTED_BY_SUB_EDITOR: 'rejected_by_sub_editor'
};
