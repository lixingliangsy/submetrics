import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/globals.css'
import ChatWidget from '../components/ChatWidget'
import { SUPPORT } from '../lib/support.config'

export default function App({ Component, pageProps }: AppProps) {
  return       <><Head>
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SubMetrics" />
        <meta property="og:description" content="Paste your subscription numbers and get MRR, ARPU, churn, LTV, and a plain-English read on what's moving - built for solo founders and small teams who'd rather not live in a spreadsheet." />
        <meta property="og:url" content="https://submetrics.lxsaihub.com/" />
        <meta property="og:image" content="https://submetrics.lxsaihub.com/og.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SubMetrics" />
        <meta name="twitter:description" content="Paste your subscription numbers and get MRR, ARPU, churn, LTV, and a plain-English read on what's moving - built for solo founders and small teams who'd rather not live in a spreadsheet." />
        <meta name="twitter:image" content="https://submetrics.lxsaihub.com/og.png" />
                                        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: '{"@context":"https://schema.org","@type":"SoftwareApplication","name":"SubMetrics","url":"https://submetrics.lxsaihub.com/","description":"Paste your subscription numbers and get MRR, ARPU, churn, LTV, and a plain-English read on what\'s moving - built for solo founders and small teams who\'d rather not live in a spreadsheet.","applicationCategory":"BusinessApplication","operatingSystem":"Web","offers":{"@type":"Offer","priceCurrency":"USD","price":"0","availability":"https://schema.org/OnlineOnly"}}' }} />
      </Head>
      <Component {...pageProps} />
      <ChatWidget productName={SUPPORT.productName} brandColor={SUPPORT.brandColor} sessionKeyPrefix={SUPPORT.productSlug} /></>
}
