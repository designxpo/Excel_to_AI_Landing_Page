import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Thank You | AnalytixLabs",
  robots: { index: false, follow: false },
  alternates: {
    canonical: 'https://careersuccess.analytixlabs.co.in/lp/thankyou-for-registration',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
