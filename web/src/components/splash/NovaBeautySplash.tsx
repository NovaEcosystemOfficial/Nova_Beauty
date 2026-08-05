"use client";

type NovaBeautySplashProps = {
  fadingOut: boolean;
};

export function NovaBeautySplash({ fadingOut }: NovaBeautySplashProps) {
  return (
    <div
      className={`nova-splash ${fadingOut ? "nova-splash--exit" : "nova-splash--enter"}`}
      role="presentation"
      aria-hidden="true"
    >
      <div className="nova-splash__frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/splash/novabeauty-splash.png" alt="" className="nova-splash__image" />
      </div>
    </div>
  );
}
