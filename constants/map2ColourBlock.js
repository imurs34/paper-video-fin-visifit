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
} = palleteColours;

const pdfBlock = [
  {
    paragraph: [1, 4, 24, 11, 31, 50, 86, 75],
    colour: darkBlue,
  },
  {
    paragraph: [5, 26, 40, 57, 69, 89],
    colour: yellow,
  },
  {
    paragraph: [14, 25, 34, 35, 54, 88, 76],
    colour: salmon,
  },
  {
    paragraph: [15, 16, 28, 29, 30, 42, 55, 72, 92],
    colour: lightGreen,
  },
  {
    paragraph: [],
    colour: petrolBlue,
  },
  {
    paragraph: [],
    colour: pink,
  }
];

export default pdfBlock;
