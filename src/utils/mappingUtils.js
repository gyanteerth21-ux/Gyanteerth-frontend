import { ADMIN_API, USER_API } from '../config';

/**
 * Fetches colleges and branches using the provided fetch function
 * and returns maps for ID to Name resolution.
 * @param {Function} fetchFunc - The authenticated fetch function to use (e.g., authFetch or smartFetch)
 * @param {string} endpoint - The API endpoint base to use (defaults to USER_API, but Admin often uses ADMIN_API)
 * @returns {Promise<{colMap: Object, brMap: Object}>}
 */
export const fetchCollegesAndBranchesMap = async (fetchFunc, endpoint = USER_API) => {
  let colMap = {};
  let brMap = {};
  
  try {
    const [colRes, brRes] = await Promise.all([
      fetchFunc(`${endpoint}/colleges`).catch(() => null),
      fetchFunc(`${endpoint}/branches`).catch(() => null)
    ]);

    if (colRes) {
      // If using smartFetch, data is inside colRes.data directly, else colRes.json()
      const colData = colRes.data ? colRes : (colRes.ok ? await colRes.json() : {});
      (colData.data || []).forEach(c => colMap[c.College_ID] = c.College_Name);
    }
    
    if (brRes) {
      const brData = brRes.data ? brRes : (brRes.ok ? await brRes.json() : {});
      (brData.data || []).forEach(b => brMap[b.branch_id] = b.branch_name);
    }
  } catch (err) {
    console.error("Failed to fetch college/branch mappings", err);
  }

  return { colMap, brMap };
};
