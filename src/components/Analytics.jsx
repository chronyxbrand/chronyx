import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

function injectScriptOnce(id, src, inlineCode) {
  if (document.getElementById(id)) return;

  if (src) {
    const script = document.createElement('script');
    script.id = id;
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  if (inlineCode) {
    const inlineScript = document.createElement('script');
    inlineScript.id = `${id}-inline`;
    inlineScript.text = inlineCode;
    document.head.appendChild(inlineScript);
  }
}

export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (GA_ID) {
      injectScriptOnce(
        'chronyx-ga-loader',
        `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
        `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `,
      );
    }

    if (META_PIXEL_ID) {
      injectScriptOnce(
        'chronyx-meta-pixel',
        null,
        `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `,
      );
    }
  }, []);

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}`;

    if (GA_ID && typeof window.gtag === 'function') {
      window.gtag('config', GA_ID, { page_path: pagePath });
    }

    if (META_PIXEL_ID && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [location.pathname, location.search]);

  return null;
}
