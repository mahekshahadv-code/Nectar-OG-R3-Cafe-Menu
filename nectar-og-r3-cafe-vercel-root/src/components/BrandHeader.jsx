import React from "react";
import { Instagram, MapPin } from "lucide-react";
import { DEFAULT_SETTINGS } from "../lib/data";

export default function BrandHeader({ settings = DEFAULT_SETTINGS }) {
  return (
    <header className="brand-header">
      <div className="brand-mark">
        <div className="brand-logo-circle"><span className="brand-og">OG</span><span className="brand-small">NECTAR</span><span className="brand-small bottom">ORIGINAL GOODNESS</span></div>
        <div className="brand-x">×</div>
        <div className="juice-badge"><span>JUICE</span><strong>KATEY!!!</strong><small>FRESH FRUIT JUICES</small></div>
      </div>
      <div className="brand-poster"><img src="/grand-opening.jpg" alt="Nectar OG R3 Cafe grand opening" /></div>
      <div className="brand-copy">
        <p className="eyebrow">{settings.coBrand}</p><h1>{settings.cafeName}</h1><p>{settings.tagline}</p>
        <div className="brand-links"><a href={settings.instagramUrl} target="_blank" rel="noreferrer"><Instagram size={18}/> @{settings.instagramHandle}</a><span><MapPin size={18}/> {settings.address}</span></div>
      </div>
    </header>
  );
}
