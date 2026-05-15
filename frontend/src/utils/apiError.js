/** User-facing API error text (BN + EN fallback). */
export function formatApiError(err) {
  if (!err) return 'ডেটা লোড করা যায়নি।';

  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return 'সার্ভার সময়মতো সাড়া দিচ্ছে না। ব্যাকএন্ড চালু আছে কিনা বা VITE_API_URL ঠিক আছে কিনা দেখুন।';
  }

  if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
    return 'নেটওয়ার্ক ত্রুটি — API-তে পৌঁছানো যায়নি। ব্যাকএন্ড URL (VITE_API_URL) ও CORS চেক করুন।';
  }

  const status = err.response?.status;
  if (status === 404) {
    return 'API রুট পাওয়া যায়নি। VITE_API_URL-এ /api আছে কিনা নিশ্চিত করুন।';
  }

  return (
    err.response?.data?.message ||
    err.message ||
    'ডেটা লোড করা যায়নি। API (VITE_API_URL) ও ব্যাকএন্ড চালু আছে কিনা দেখুন।'
  );
}
