const getPagination = (
  pageParam,
  limitParam,
  options = {}
) => {
  const page = Math.max(parseInt(pageParam, 10) || 1, 1);
  const limit = Math.min(
    parseInt(limitParam, 10) || options.defaultLimit || 10,
    options.maxLimit || 100
  );

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

module.exports = {
  getPagination,
  buildPaginationMeta,
};
