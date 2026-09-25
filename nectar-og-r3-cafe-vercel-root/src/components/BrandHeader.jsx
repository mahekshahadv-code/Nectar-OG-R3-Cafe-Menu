import { Instagram, MapPin } from "lucide-react";
import { DEFAULT_SETTINGS } from "../lib/data";

export default function BrandHeader({ settings = DEFAULT_SETTINGS }) {
  return (
    <header className="brand-header">
      <div className="brand-logos">
        <img
          src="/nectar-og-logo.png"
          alt="Nectar OG Cafe"
          className="nectar-logo"
        />

        <div className="brand-x">×</div>

        <img
          src="/juice-katey-logo.png"
          alt="Juice Katey"
          className="juice-katey-logo"
        />
      </div>

      <div className="brand-copy">
        <p className="eyebrow">{settings.coBrand}</p>

        <h1>{settings.cafeName}</h1>

        <p>{settings.tagline}</p>

        <div className="brand-links">
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={18} />
            @{settings.instagramHandle}
          </a>

          <a
            href="https://www.google.com/maps/search/?api=1&query=R3+Badminton+Excellencia+Road+Kothapet+Hyderabad"
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={18} />
            {settings.address}
          </a>
        </div>
      </div>
    </header>
  );
}
