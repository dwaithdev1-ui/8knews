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
    PENDING_REVIEW: 'pending_review',
    PENDING_APPROVAL: 'pending_approval',
    PENDING_LEGAL_REVIEW: 'pending_legal_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    PUBLISHED: 'published'
};
