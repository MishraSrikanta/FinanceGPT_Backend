/*
 * Resolve the acting user for every request.
 * The client authenticates via the `x-user-id` header (forwarded alongside the
 * Bearer token). We fall back to query/body params so existing callers and
 * quick manual testing keep working.
 */
function resolveUser(req, _res, next) {
  const headerId = req.headers["x-user-id"];
  const parentId =
    headerId ||
    req.query.parentId ||
    req.query.userId ||
    (req.body && (req.body.parentId || req.body.userId)) ||
    "";

  req.parentId = `${parentId}`;
  req.userId = req.parentId;
  next();
}

module.exports = { resolveUser };
