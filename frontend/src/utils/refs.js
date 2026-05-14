/** Normalize populated or raw Mongoose ref to string id */
export function refToId(ref) {
  if (ref == null || ref === '') return '';
  if (typeof ref === 'object' && ref._id != null) return String(ref._id);
  return String(ref);
}
