'use client';
import ThankYouPage from '@/components/ThankYouPage';
import { Suspense } from 'react';

function ThankYouWrapper() {
  return (
    <ThankYouPage
      heading="You're Registered!"
      subCopy="Your spot for the upcoming masterclass is confirmed. Check your email for joining details."
      conversionId="AW-783236209/8w9vCIrelv4aEPH4vPUC"
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThankYouWrapper />
    </Suspense>
  );
}
