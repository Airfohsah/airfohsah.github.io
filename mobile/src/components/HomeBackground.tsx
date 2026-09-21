import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Path,
  Ellipse,
} from 'react-native-svg';
import { StyleSheet } from 'react-native';

// Stylized approximation of a dusk mountain-and-river scene — painted
// brush-stroke texture from the reference mockup isn't reproducible without
// a real illustration asset, but the composition (gradient sky, glowing
// sun, layered mountain silhouettes, winding river, corner foliage) is.
export function HomeBackground() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 400 866"
      preserveAspectRatio="xMidYMid slice"
      style={StyleSheet.absoluteFill}
    >
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#100c2e" />
          <Stop offset="0.45" stopColor="#211a4d" />
          <Stop offset="0.72" stopColor="#3a2a5c" />
          <Stop offset="1" stopColor="#0d0a24" />
        </LinearGradient>
        <RadialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#ffcf6b" stopOpacity="0.95" />
          <Stop offset="0.55" stopColor="#ff9c3f" stopOpacity="0.55" />
          <Stop offset="1" stopColor="#ff9c3f" stopOpacity="0" />
        </RadialGradient>
        <LinearGradient id="river" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffbf7a" stopOpacity="0.55" />
          <Stop offset="0.4" stopColor="#7a6bb8" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#221a4a" stopOpacity="0.5" />
        </LinearGradient>
        <LinearGradient id="mtnBack" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#463c85" />
          <Stop offset="1" stopColor="#312868" />
        </LinearGradient>
        <LinearGradient id="mtnMid" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#332a63" />
          <Stop offset="1" stopColor="#221a4a" />
        </LinearGradient>
        <LinearGradient id="mtnFront" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#211a48" />
          <Stop offset="1" stopColor="#150f32" />
        </LinearGradient>
      </Defs>

      <Rect x="0" y="0" width="400" height="866" fill="url(#sky)" />

      {/* clouds */}
      <Ellipse cx="90" cy="160" rx="70" ry="14" fill="#4a3f7a" opacity="0.35" />
      <Ellipse cx="300" cy="120" rx="55" ry="10" fill="#4a3f7a" opacity="0.3" />
      <Ellipse cx="230" cy="200" rx="90" ry="12" fill="#4a3f7a" opacity="0.25" />

      {/* sun */}
      <Circle cx="315" cy="430" r="140" fill="url(#sun)" />
      <Circle cx="315" cy="430" r="38" fill="#ffd27a" opacity="0.9" />

      {/* river — wide glowing ribbon winding down through the mountains */}
      <Path
        d="M175,480 C210,530 165,575 205,630 C235,670 205,715 245,770 C265,800 235,835 255,866 L195,866 C210,835 230,800 210,770 C180,725 205,675 170,630 C140,585 175,540 145,480 Z"
        fill="url(#river)"
      />

      {/* back mountain range */}
      <Path
        d="M0,530 L40,470 L90,510 L140,440 L200,500 L260,455 L320,505 L400,475 L400,560 L0,560 Z"
        fill="url(#mtnBack)"
      />

      {/* mid mountain range */}
      <Path
        d="M0,600 L60,545 L110,585 L170,525 L230,590 L280,550 L340,595 L400,565 L400,650 L0,650 Z"
        fill="url(#mtnMid)"
      />

      {/* front mountain range */}
      <Path
        d="M0,690 L50,630 L100,670 L160,615 L210,670 L270,625 L330,675 L400,645 L400,750 L0,750 Z"
        fill="url(#mtnFront)"
      />

      {/* small corner foliage accents */}
      <Path
        d="M0,866 L0,800 C18,812 14,788 28,776 C25,795 34,802 30,820 C42,808 40,790 54,784 C46,806 52,824 38,842 C50,836 58,824 68,830 C56,846 38,856 20,866 Z"
        fill="#0d0828"
        opacity="0.85"
      />
      <Path
        d="M400,866 L400,806 C384,818 390,792 374,780 C378,798 368,806 372,824 C358,812 362,792 346,786 C356,808 350,826 366,844 C354,838 344,826 334,832 C348,848 366,858 386,866 Z"
        fill="#0d0828"
        opacity="0.85"
      />
    </Svg>
  );
}
