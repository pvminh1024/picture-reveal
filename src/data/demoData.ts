import type { SetupQuestion } from '../types/game';

// Self-contained offline vector illustration of Vietnam landscape & symbols
export const DEMO_TOPIC_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0f2027"/>
      <stop offset="50%" stop-color="#203a43"/>
      <stop offset="100%" stop-color="#2c5364"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFE000"/>
      <stop offset="100%" stop-color="#799F0C"/>
    </linearGradient>
    <linearGradient id="mountain1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e3c72"/>
      <stop offset="100%" stop-color="#2a5298"/>
    </linearGradient>
    <linearGradient id="mountain2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#11998e"/>
      <stop offset="100%" stop-color="#38ef7d"/>
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFD700" stop-opacity="1"/>
      <stop offset="70%" stop-color="#FF8C00" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#FF4500" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background Sky -->
  <rect width="800" height="800" fill="url(#sky)"/>

  <!-- Glowing Sun / Dawn -->
  <circle cx="400" cy="340" r="180" fill="url(#sun)"/>

  <!-- Distant Mountains (Halong Bay style karsts) -->
  <path d="M 50 600 Q 140 380 230 600 Q 300 440 380 600 Q 470 350 560 600 Q 640 420 750 600 L 800 800 L 0 800 Z" fill="#1b2a4a" opacity="0.8"/>
  <path d="M 0 650 Q 100 480 200 650 Q 320 420 440 650 Q 560 460 680 650 Q 740 540 800 650 L 800 800 L 0 800 Z" fill="#0d47a1" opacity="0.6"/>

  <!-- Emerald Waters -->
  <rect y="600" width="800" height="200" fill="#09203f"/>
  <ellipse cx="400" cy="680" rx="360" ry="40" fill="#1e3c72" opacity="0.5"/>
  <ellipse cx="400" cy="740" rx="300" ry="25" fill="#2a5298" opacity="0.4"/>

  <!-- Iconic Halong karst in foreground -->
  <path d="M 160 680 Q 210 490 260 520 Q 290 540 310 680 Z" fill="#132743"/>
  <path d="M 500 680 Q 550 470 600 500 Q 630 530 650 680 Z" fill="#132743"/>

  <!-- Golden Yellow Star Emblem (Central Symbol) -->
  <g transform="translate(400, 260) scale(1.1)">
    <circle cx="0" cy="0" r="110" fill="#da251d" stroke="#FFD700" stroke-width="6" opacity="0.95"/>
    <polygon points="0,-85 25,-26 85,-26 36,10 54,69 0,33 -54,69 -36,10 -85,-26 -25,-26" fill="#FFD700"/>
  </g>

  <!-- Large Calligraphy / Text -->
  <text x="400" y="470" font-family="'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">
    VIỆT NAM
  </text>
  <text x="400" y="520" font-family="'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="600" fill="#FFD700" text-anchor="middle" letter-spacing="6">
    ĐẤT NƯỚC - CON NGƯỜI
  </text>

  <!-- Decorative Frame -->
  <rect x="25" y="25" width="750" height="750" rx="20" fill="none" stroke="#FFD700" stroke-width="4" opacity="0.6"/>
  <rect x="35" y="35" width="730" height="730" rx="14" fill="none" stroke="#FFD700" stroke-width="1.5" stroke-dasharray="8 8" opacity="0.4"/>
</svg>
`)}`;

export const DEMO_QUESTIONS: SetupQuestion[] = [
  {
    id: 1,
    text: 'Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là thành phố nào?',
    optionA: 'TP. Hồ Chí Minh',
    optionB: 'Đà Nẵng',
    optionC: 'Hà Nội',
    optionD: 'Huế',
    correctAnswer: 'C',
  },
  {
    id: 2,
    text: 'Dòng sông nào dài nhất chảy qua lãnh thổ Việt Nam?',
    optionA: 'Sông Hồng',
    optionB: 'Sông Mê Kông',
    optionC: 'Sông Đồng Nai',
    optionD: 'Sông Đà',
    correctAnswer: 'B',
  },
  {
    id: 3,
    text: 'Di sản thiên nhiên thế giới Vịnh Hạ Long thuộc tỉnh nào?',
    optionA: 'Hải Phòng',
    optionB: 'Quảng Ninh',
    optionC: 'Thanh Hóa',
    optionD: 'Nghệ An',
    correctAnswer: 'B',
  },
  {
    id: 4,
    text: 'Quốc hoa biểu tượng cho sự thanh cao của người Việt Nam là loài hoa nào?',
    optionA: 'Hoa hồng',
    optionB: 'Hoa mai',
    optionC: 'Hoa sen',
    optionD: 'Hoa đào',
    correctAnswer: 'C',
  },
  {
    id: 5,
    text: 'Hiện nay, nước Việt Nam có tổng cộng bao nhiêu tỉnh và thành phố trực thuộc trung ương?',
    optionA: '61',
    optionB: '63',
    optionC: '64',
    optionD: '58',
    correctAnswer: 'B',
  },
  {
    id: 6,
    text: 'Đỉnh núi nào được mệnh danh là "Nóc nhà Đông Dương" với độ cao 3.143m?',
    optionA: 'Pù Luông',
    optionB: 'Bạch Mã',
    optionC: 'Fansipan',
    optionD: 'Langbiang',
    correctAnswer: 'C',
  },
  {
    id: 7,
    text: 'Món ăn truyền thống "Phở" nổi tiếng khắp thế giới có cội nguồn từ vùng miền nào?',
    optionA: 'Miền Trung',
    optionB: 'Miền Nam',
    optionC: 'Tây Nguyên',
    optionD: 'Miền Bắc',
    correctAnswer: 'D',
  },
  {
    id: 8,
    text: 'Trang phục truyền thống thướt tha tôn vinh vẻ đẹp phụ nữ Việt Nam là gì?',
    optionA: 'Áo tứ thân',
    optionB: 'Áo dài',
    optionC: 'Áo bà ba',
    optionD: 'Áo yếm',
    correctAnswer: 'B',
  },
  {
    id: 9,
    text: 'Quần thể di tích Cố đô Huế thơ mộng tọa lạc bên bờ dòng sông nổi tiếng nào?',
    optionA: 'Sông Hương',
    optionB: 'Sông Thu Bồn',
    optionC: 'Sông Hàn',
    optionD: 'Sông Lam',
    correctAnswer: 'A',
  },
];

export const DEMO_TOPIC_KEYWORD = 'Việt Nam';
