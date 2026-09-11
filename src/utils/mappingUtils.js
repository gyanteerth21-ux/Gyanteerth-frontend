import { ADMIN_API, USER_API } from '../config';

/**
 * Fetches colleges and branches using the provided fetch function
 * and returns maps for ID to Name resolution.
 * @param {Function} fetchFunc - The authenticated fetch function to use (e.g., authFetch)
 * @param {string} endpoint - The API endpoint base to use (defaults to USER_API, but Admin often uses ADMIN_API)
 * @returns {Promise<{colMap: Object, brMap: Object, degMap: Object}>}
 */
export const fetchCollegesAndBranchesMap = async (fetchFunc, endpoint = USER_API) => {
  let colMap = {};
  let brMap = {};
  let degMap = {};
  
  try {
    const [colRes, brRes, degRes] = await Promise.all([
      fetchFunc(`${endpoint}/colleges`).catch(() => null),
      fetchFunc(`${endpoint}/branches`).catch(() => null),
      fetchFunc(`${endpoint}/degrees`).catch(() => null)
    ]);

    if (colRes) {
      const colData = colRes.ok ? await colRes.json() : {};
      (colData.data || []).forEach(c => colMap[c.College_ID] = c.College_Name);
    }
    
    if (brRes) {
      const brData = brRes.data ? brRes : (brRes.ok ? await brRes.json() : {});
      (brData.data || []).forEach(b => brMap[b.branch_id] = b.branch_name);
    }
    if (degRes) {
      const degData = degRes.data ? degRes : (degRes.ok ? await degRes.json() : {});
      (degData.data || []).forEach(d => degMap[d.degree_id] = d.degree_name);
    }
  } catch (err) {
    console.error("Failed to fetch college/branch/degree mappings", err);
  }

  return { colMap, brMap, degMap };
};
