// Ilustrações vetoriais próprias: o projeto não depende de imagens externas.
export default function InstrumentArt({ type = 'acoustic', className = '' }) {
  const strings = (count, x, y1, y2, gap = 3) => Array.from({ length: count }, (_, i) => <line key={i} x1={x + i * gap} y1={y1} x2={x + i * gap} y2={y2} stroke="#d8cec0" strokeWidth="1" />);
  return <svg className={`instrument-art ${className}`} viewBox="0 0 320 250" aria-hidden="true">
    <ellipse cx="160" cy="228" rx="76" ry="9" fill="#182b26" opacity=".09" />
    {['acoustic', 'electric', 'bass'].includes(type) && <g transform="rotate(24 160 130)">
      <rect x="149" y="39" width="23" height="112" rx="3" fill="#754d35" />
      <path d="M147 16 L170 16 L179 41 L146 47 Z" fill="#b98b59" />
      {[24, 33, 42].map(y => <g key={y}><circle cx="145" cy={y} r="3.5" fill="#d3caba" /><circle cx="177" cy={y - 3} r="3.5" fill="#d3caba" /></g>)}
      {type === 'acoustic' ? <>
        <path d="M140 116 C124 106 104 115 104 138 C104 150 117 153 107 168 C78 204 113 226 160 226 C207 226 238 201 211 169 C199 155 213 148 213 134 C213 113 190 106 177 117 Z" fill="#bd874b" stroke="#845e37" strokeWidth="3" />
        <path d="M141 121 C122 113 113 122 113 139 C113 156 126 154 115 172 C92 205 122 218 160 218 C199 218 224 201 204 174 C189 153 204 151 204 137 C204 120 190 114 177 122" fill="none" stroke="#e5bf83" strokeWidth="2" />
        <circle cx="161" cy="151" r="17" fill="#392b21" stroke="#e2bd85" strokeWidth="4" />
        <path d="M180 134 Q210 161 187 187 L174 181 L177 157 Z" fill="#4f3427" />
        <rect x="142" y="194" width="39" height="7" rx="2" fill="#4e3325" />
      </> : <>
        <path d="M145 114 C115 105 122 153 114 160 C86 182 104 219 156 226 C214 229 228 196 208 169 C194 149 207 115 184 103 L177 132 L147 140 Z" fill={type === 'bass' ? '#8e5133' : '#547465'} stroke="#344d42" strokeWidth="3" />
        <path d="M143 141 L175 136 C189 150 181 159 193 176 C202 197 183 211 154 209 L133 193 Z" fill="#efe7d5" />
        <rect x="146" y="163" width="29" height="8" rx="2" fill="#303b36" /><rect x="146" y="184" width="29" height="8" rx="2" fill="#303b36" />
        <rect x="146" y="202" width="29" height="8" rx="1" fill="#bbbdb5" />
        <circle cx="195" cy="193" r="4" fill="#d6bc83" />
      </>}
      {[57, 70, 83, 95, 106, 116].map(y => <line key={y} x1="151" y1={y} x2="171" y2={y} stroke="#a8967e" />)}
      {strings(type === 'bass' ? 4 : 6, 153, 35, 204, type === 'bass' ? 4 : 2.6)}
    </g>}
    {type === 'keyboard' && <g>
      <path d="M99 200 L218 129 M100 129 L222 200" stroke="#43514b" strokeWidth="6" strokeLinecap="round" />
      <path d="M49 92 L264 92 L280 153 L40 153 Z" fill="#344b43" stroke="#273d35" strokeWidth="3" />
      <path d="M53 116 L267 116 L273 145 L47 145 Z" fill="#fbf4e6" />
      {Array.from({ length: 22 }, (_, i) => <line key={i} x1={55 + i * 9.7} y1="117" x2={51 + i * 10} y2="145" stroke="#74756c" />)}
      {Array.from({ length: 15 }, (_, i) => <rect key={i} x={59 + i * 14} y="116" width="6" height="17" fill="#25342e" />)}
      <rect x="138" y="98" width="36" height="11" rx="2" fill="#a4b9a1" />
      {[72, 87, 219, 235, 250].map(x => <circle key={x} cx={x} cy="103" r="3" fill="#c5cfc2" />)}
    </g>}
    {type === 'drums' && <g stroke="#6b7069" strokeWidth="3">
      <path d="M72 110 L72 208 M51 218 L72 208 L91 218 M245 94 L245 208 M227 219 L245 208 L265 219" fill="none" />
      <ellipse cx="70" cy="108" rx="47" ry="7" fill="#c5a56b" stroke="#a5874e" />
      <ellipse cx="247" cy="88" rx="40" ry="7" fill="#c5a56b" stroke="#a5874e" />
      <path d="M83 158 L72 218 M232 160 L248 218" />
      <rect x="102" y="114" width="49" height="44" rx="6" fill="#aa6553" />
      <rect x="166" y="112" width="49" height="45" rx="6" fill="#aa6553" />
      <ellipse cx="126" cy="115" rx="24" ry="7" fill="#e9e4d9" />
      <ellipse cx="190" cy="113" rx="24" ry="7" fill="#e9e4d9" />
      <rect x="218" y="151" width="35" height="42" rx="5" fill="#9e5b4c" /><ellipse cx="236" cy="152" rx="18" ry="6" fill="#e9e4d9" />
      <circle cx="162" cy="179" r="50" fill="#aa6553" />
      <circle cx="162" cy="179" r="43" fill="#eae3d6" />
      <circle cx="174" cy="195" r="9" fill="#3b4a40" stroke="none" />
      <path d="M122 214 L111 228 M200 214 L212 228" />
    </g>}
    {type === 'violin' && <g transform="rotate(20 160 130)">
      <path d="M156 30 C140 21 156 13 167 24 C177 39 166 42 162 44" fill="none" stroke="#8e5835" strokeWidth="8" />
      <rect x="152" y="44" width="15" height="94" fill="#574232" />
      <path d="M141 122 C113 112 106 142 125 154 L123 168 C96 192 116 225 157 225 C205 225 219 191 192 171 L189 153 C210 131 182 110 169 123 Z" fill="#ad7043" stroke="#6d452e" strokeWidth="3" />
      <path d="M130 164 Q119 172 135 186 M179 166 Q192 177 177 192" stroke="#392d25" strokeWidth="3" fill="none" />
      <path d="M155 181 L163 181 L167 216 L150 216 Z" fill="#372e25" />
      {strings(4, 155, 41, 215, 2)}
      <path d="M222 31 L216 216" stroke="#815c3d" strokeWidth="5" strokeLinecap="round" />
      <path d="M217 36 L211 215" stroke="#e8dbc3" strokeWidth="3" />
    </g>}
    {type === 'flute' && <g transform="rotate(48 160 120)">
      <rect x="153" y="19" width="17" height="199" rx="5" fill="#bcc8c7" stroke="#788d8e" strokeWidth="2" />
      <rect x="160" y="24" width="4" height="181" fill="#eef4ef" opacity=".7" />
      <ellipse cx="161" cy="42" rx="10" ry="5" fill="#d6dfd8" stroke="#748784" />
      <ellipse cx="161" cy="42" rx="5" ry="2" fill="#586b65" />
      {[85, 101, 117, 133, 149, 165, 190].map(y => <g key={y}><circle cx="151" cy={y} r="6" fill="#ced7cc" stroke="#7b908b" /><path d={`M155 ${y} H174`} stroke="#7b908b" strokeWidth="2" /></g>)}
    </g>}
    {type === 'sax' && <g transform="rotate(-14 160 130)">
      <path d="M159 37 C176 33 182 53 180 64 L156 174 C150 214 195 215 203 185 L209 155" fill="none" stroke="#a17a38" strokeWidth="25" strokeLinecap="round" />
      <path d="M159 37 C176 33 182 53 180 64 L156 174 C150 214 195 215 203 185 L209 155" fill="none" stroke="#d8b86c" strokeWidth="20" strokeLinecap="round" />
      <path d="M139 27 L159 34 L156 46 L138 36 Z" fill="#3c4236" />
      <path d="M196 159 L226 151 L235 123 L180 136 Z" fill="#dabb73" stroke="#aa8847" strokeWidth="2" />
      <ellipse cx="207" cy="130" rx="29" ry="10" fill="#8b6a32" stroke="#e3c784" strokeWidth="4" transform="rotate(-14 207 130)" />
      {[81, 98, 115, 132, 149, 166].map((y, i) => <circle key={y} cx={176 - i * 3.6} cy={y} r="6" fill="#e7cf92" stroke="#a1864c" />)}
    </g>}
  </svg>;
}
