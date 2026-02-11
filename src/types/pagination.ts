export interface PaginationParams {
    page: number;
    limit: number;
    offset: number;
}

export interface PaginationResult<T> {
    data: T[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export function parsePaginationParams(query: { page?: string; limit?: string }): PaginationParams {
    const page = Math.max(1, parseInt(query.page || String(DEFAULT_PAGE), 10) || DEFAULT_PAGE);
    const limit = Math.min(
        MAX_LIMIT,
        Math.max(1, parseInt(query.limit || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    );
    const offset = (page - 1) * limit;
    return { page, limit, offset };
}

export function buildPaginationResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginationResult<T> {
    const totalPages = Math.ceil(total / limit) || 1;
    return {
        data,
        totalItems: total,
        currentPage: page,
        totalPages,
        total,
        page,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
}
