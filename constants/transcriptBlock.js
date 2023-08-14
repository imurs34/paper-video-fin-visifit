import palleteColours from './pallete';

const {
  yellow,
  darkBlue,
  salmon,
  petrolBlue,
  pink,
  purple,
  lightGreen,
  platinum,
  champagnePink,
  linen,
  mintCream,
  columbiaBlue,
  teaRose,
  beige,
  lemonYellow
} = palleteColours;

const paragraph = [
  { initial: 4, final: 9, color: darkBlue },
  { initial: 10, final: 12, color: yellow },
  { initial: 13, final: 27, color: salmon },
  { initial: 19, final: 27, color: lightGreen },

  { initial: 28, final: 29, color: darkBlue },
  { initial: 30, final: 31, color: yellow },
  { initial: 32, final: 42, color: darkBlue },

  { initial: 43, final: 46, color: yellow },
  { initial: 43, final: 70, color: salmon },
  { initial: 47, final: 59, color: lightGreen },
  { initial: 65, final: 70, color: darkBlue },

  { initial: 71, final: 80, color: salmon },
  { initial: 71, final: 80, color: yellow },
  { initial: 81, final: 82, color: lightGreen },

  { initial: 83, final: 89, color: darkBlue },
  { initial: 83, final: 93, color: salmon },
  { initial: 83, final: 89, color: yellow },

  { initial: 94, final: 97, color: lightGreen },
  { initial: 94, final: 100, color: darkBlue },
  { initial: 98, final: 102, color: salmon },

  { initial: 103, final: 120, color: darkBlue },
  { initial: 103, final: 115, color: lightGreen },

  { initial: 121, final: 200, color: yellow },
  { initial: 121, final: 200, color: lightGreen },
  { initial: 121, final: 200, color: salmon }
];

const sections = [
  { initial: 4, final: 12, color: columbiaBlue },
  { initial: 13, final: 29, color: linen },
  { initial: 30, final: 31, color: beige },
  { initial: 32, final: 42, color: columbiaBlue },
  { initial: 43, final: 82, color: beige },
  { initial: 83, final: 100, color: teaRose },
  { initial: 94, final: 102, color: mintCream },
  { initial: 103, final: 129, color: teaRose },
  { initial: 103, final: 115, color: columbiaBlue },
  { initial: 121, final: 129, color: mintCream },
  // { initial: 240, final: 27, color: lemonYellow }
];

export { paragraph, sections };
