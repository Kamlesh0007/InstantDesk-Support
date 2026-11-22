"use client";

import Script from "next/script";

const UnicornBackground = () => {
  return (
    <>
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="h-full w-full opacity-20">
          <div
            data-us-project="NMlvqnkICwYYJ6lYb064"
            className="absolute left-0 top-0 h-full w-full"
          />
        </div>

        <div className="absolute inset-0 bg-linear-to-t from-[#050509] via-transparent to-transparent opacity-80" />
      </div>

      {/* Unicorn Studio Script */}
      <Script
        id="unicorn-studio"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(){
              if(!window.UnicornStudio){
                window.UnicornStudio={isInitialized:!1};
                var i=document.createElement("script");
                i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";
                i.onload=function(){
                  window.UnicornStudio.isInitialized ||
                  (UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)
                };
                (document.head || document.body).appendChild(i)
              }
            }();
          `,
        }}
      />
    </>
  );
};

export default UnicornBackground;