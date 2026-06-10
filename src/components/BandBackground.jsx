import React from 'react';
import './BandBackground.css';

export default function BandBackground() {
  return (
    <div className="band-bg-wrap" aria-hidden="true">
      <svg
        className="band-bg-svg"
        viewBox="0 0 1600 560"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          {/* Colored spotlight beam gradients */}
          <linearGradient id="bPink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FF006E" stopOpacity="0" />
            <stop offset="100%" stopColor="#FF006E" stopOpacity="0.38" />
          </linearGradient>
          <linearGradient id="bCyan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#00CFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#00CFFF" stopOpacity="0.34" />
          </linearGradient>
          <linearGradient id="bWhite" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.32" />
          </linearGradient>
          <linearGradient id="bPurple" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#A855F7" stopOpacity="0" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.36" />
          </linearGradient>

          {/* Floor haze */}
          <radialGradient id="stageHaze" cx="50%" cy="100%" r="55%">
            <stop offset="0%"   stopColor="#C084FC" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
          </radialGradient>

          {/* Spotlight source glow */}
          <filter id="srcBlur" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
          </filter>

          {/* Beam soft-edge blur */}
          <filter id="beamBlur" x="-20%" y="-5%" width="140%" height="115%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" />
          </filter>
        </defs>

        {/* ── Stage floor haze ── */}
        <ellipse fill="url(#stageHaze)" cx="800" cy="512" rx="820" ry="140" />

        {/* ── Spotlight beams (blurred, animated) ── */}
        <g filter="url(#beamBlur)" className="band-beams">
          <polygon fill="url(#bPink)"   points="162,6  48,512 315,512" />
          <polygon fill="url(#bCyan)"   points="412,2  292,512 572,512" />
          <polygon fill="url(#bWhite)"  points="800,0  636,512 964,512" />
          <polygon fill="url(#bPurple)" points="1188,2 1028,512 1308,512" />
          <polygon fill="url(#bCyan)"   points="1438,6 1285,512 1548,512" />
        </g>

        {/* ── Stage platform ── */}
        <rect fill="currentColor" x="0" y="508" width="1600" height="7"  opacity="0.85" />
        <rect fill="currentColor" x="0" y="515" width="1600" height="45" opacity="0.30" />

        {/* ── Stage monitors ── */}
        <g fill="currentColor" opacity="0.55">
          <path d="M108,508 L72,548 L208,548 L184,508 Z" />
          <path d="M368,508 L332,548 L468,548 L444,508 Z" />
          <path d="M662,508 L626,548 L762,548 L738,508 Z" />
          <path d="M912,508 L876,548 L1012,548 L988,508 Z" />
          <path d="M1168,508 L1132,548 L1268,548 L1244,508 Z" />
        </g>

        {/* ══════════════════════════════════════════════════════════════════
             BAND SILHOUETTES  (fill="currentColor" → white/dark per theme)
            ══════════════════════════════════════════════════════════════════ */}

        {/* ── 1. GUITARIST ── */}
        <g fill="currentColor" transform="translate(180,508)">
          <circle cx="0" cy="-175" r="22" />
          <rect x="-6" y="-153" width="12" height="18" rx="3" />
          <path d="M-28,-135 L28,-135 L22,-62 L-22,-62 Z" />
          <path d="M-22,-62 L-25,0 L-11,0 L-9,-62 Z" />
          <path d="M9,-62 L11,0 L25,0 L22,-62 Z" />
          {/* guitar body */}
          <path d="M42,-115 C32,-104 30,-84 34,-63 C38,-40 53,-34 66,-40
                   C79,-46 80,-64 76,-85 C72,-106 57,-122 42,-115 Z" />
          <path d="M46,-88 C42,-81 42,-76 46,-72"
                fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          {/* guitar neck */}
          <path d="M40,-115 L14,-206 L20,-208 L46,-117 Z" />
          <rect x="12" y="-215" width="14" height="12" rx="3" />
          {/* arms */}
          <path d="M-28,-130 L16,-203 L21,-196 L-23,-124 Z" />
          <path d="M28,-128 L68,-78 L61,-72 L21,-122 Z" />
        </g>

        {/* ── 2. VOCALIST ── */}
        <g fill="currentColor" transform="translate(440,508)">
          <circle cx="5" cy="-182" r="23" />
          <rect x="-1" y="-159" width="13" height="18" rx="3" />
          <path d="M-26,-141 L33,-141 L27,-66 L-20,-66 Z" />
          <path d="M-20,-66 L-23,0 L-9,0 L-7,-66 Z" />
          <path d="M7,-66 L9,0 L23,0 L20,-66 Z" />
          {/* arms raised high */}
          <path d="M-26,-135 L-70,-200 L-61,-206 L-18,-141 Z" />
          <path d="M33,-135 L77,-194 L69,-200 L25,-141 Z" />
          {/* mic */}
          <ellipse cx="80" cy="-204" rx="10" ry="13" />
          <rect x="76" y="-192" width="8" height="22" rx="3" />
        </g>

        {/* ── 3. DRUMMER ── */}
        <g fill="currentColor" transform="translate(700,508)">
          <circle cx="0" cy="-152" r="22" />
          <rect x="-6" y="-130" width="12" height="16" rx="3" />
          {/* torso seated */}
          <path d="M-26,-114 L26,-114 L20,-52 L-20,-52 Z" />
          {/* legs bent */}
          <path d="M-20,-52 L-42,-20 L-30,-14 L-8,-52 Z" />
          <path d="M8,-52 L30,-20 L42,-14 L20,-52 Z" />
          <path d="M-42,-20 L-44,0 L-30,0 L-30,-14 Z" />
          <path d="M30,-20 L30,0 L44,0 L42,-14 Z" />
          {/* arms raised with sticks */}
          <path d="M-26,-108 L-62,-178 L-53,-184 L-17,-114 Z" />
          <rect x="-68" y="-208" width="4" height="36" rx="2"
                transform="rotate(-15 -66 -204)" />
          <path d="M26,-108 L60,-172 L52,-178 L18,-114 Z" />
          <rect x="62" y="-200" width="4" height="36" rx="2"
                transform="rotate(15 64 -196)" />
          {/* drum kit */}
          <ellipse cx="0"   cy="-22"  rx="44" ry="24" />
          <ellipse cx="-25" cy="-75"  rx="20" ry="8" />
          <rect x="-45" y="-79" width="40" height="5" rx="2" />
          <ellipse cx="-64" cy="-100" rx="17" ry="5" />
          <ellipse cx="-64" cy="-107" rx="17" ry="5" />
          <rect x="-66" y="-100" width="4" height="102" />
          <ellipse cx="58"  cy="-46"  rx="24" ry="10" />
          <ellipse cx="75"  cy="-108" rx="21" ry="6" />
          <ellipse cx="0"   cy="-50"  rx="20" ry="7" />
          <rect x="-3" y="-50" width="6" height="50" />
        </g>

        {/* ── 4. BASSIST ── */}
        <g fill="currentColor" transform="translate(950,508)">
          <circle cx="0" cy="-175" r="22" />
          <rect x="-6" y="-153" width="12" height="18" rx="3" />
          <path d="M-28,-135 L28,-135 L22,-62 L-22,-62 Z" />
          <path d="M-22,-62 L-25,0 L-11,0 L-9,-62 Z" />
          <path d="M9,-62 L11,0 L25,0 L22,-62 Z" />
          {/* bass guitar body */}
          <path d="M-58,-108 C-70,-96 -73,-74 -69,-50
                   C-65,-26 -49,-18 -35,-24
                   C-21,-30 -18,-48 -22,-72
                   C-26,-96 -44,-116 -58,-108 Z" />
          {/* bass neck */}
          <path d="M-55,-108 L-18,-218 L-12,-216 L-49,-106 Z" />
          <rect x="-22" y="-225" width="14" height="12" rx="3" />
          {/* arms */}
          <path d="M-28,-130 L-16,-212 L-10,-209 L-22,-127 Z" />
          <path d="M28,-130 L-28,-83 L-33,-90 L23,-137 Z" />
        </g>

        {/* ── 5. KEYBOARDIST ── */}
        <g fill="currentColor" transform="translate(1200,508)">
          <circle cx="0" cy="-175" r="22" />
          <rect x="-6" y="-153" width="12" height="18" rx="3" />
          <path d="M-28,-135 L28,-135 L22,-62 L-22,-62 Z" />
          <path d="M-22,-62 L-25,0 L-11,0 L-9,-62 Z" />
          <path d="M9,-62 L11,0 L25,0 L22,-62 Z" />
          {/* arms forward */}
          <path d="M-28,-128 L-44,-88 L-36,-83 L-20,-123 Z" />
          <path d="M28,-128 L44,-88 L36,-83 L20,-123 Z" />
          {/* keyboard */}
          <rect x="-64" y="-91" width="128" height="20" rx="5" />
          <line x1="-53" y1="-91" x2="-53" y2="-73" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
          <line x1="-38" y1="-91" x2="-38" y2="-73" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
          <line x1="-23" y1="-91" x2="-23" y2="-73" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
          <line x1="-8"  y1="-91" x2="-8"  y2="-73" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
          <line x1="7"   y1="-91" x2="7"   y2="-73" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
          <line x1="22"  y1="-91" x2="22"  y2="-73" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
          <line x1="37"  y1="-91" x2="37"  y2="-73" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
          <line x1="52"  y1="-91" x2="52"  y2="-73" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" />
          {/* stand */}
          <rect x="-54" y="-73" width="8" height="73" rx="3" />
          <rect x="46"  y="-73" width="8" height="73" rx="3" />
          <rect x="-54" y="-42" width="108" height="7" rx="3" />
        </g>

        {/* ── Glowing spotlight sources at top ── */}
        <g filter="url(#srcBlur)">
          <circle cx="162"  cy="6"  r="18" fill="#FF006E" />
          <circle cx="412"  cy="2"  r="18" fill="#00CFFF" />
          <circle cx="800"  cy="0"  r="22" fill="#FFFFFF"  opacity="0.9" />
          <circle cx="1188" cy="2"  r="18" fill="#A855F7" />
          <circle cx="1438" cy="6"  r="18" fill="#00CFFF" />
        </g>
        {/* Sharp dot cores */}
        <circle cx="162"  cy="6"  r="5" fill="#FF006E" />
        <circle cx="412"  cy="2"  r="5" fill="#00CFFF" />
        <circle cx="800"  cy="0"  r="6" fill="#FFFFFF" />
        <circle cx="1188" cy="2"  r="5" fill="#A855F7" />
        <circle cx="1438" cy="6"  r="5" fill="#00CFFF" />

        {/* ── Floating music notes ── */}
        <g fill="currentColor" className="band-notes" fontSize="38" fontFamily="serif" opacity="0.42">
          <text x="72"   y="218">♪</text>
          <text x="308"  y="152">♫</text>
          <text x="558"  y="100">♩</text>
          <text x="836"  y="184">♪</text>
          <text x="1078" y="122">♫</text>
          <text x="1352" y="200">♩</text>
          <text x="1490" y="92">♪</text>
        </g>
      </svg>
    </div>
  );
}
