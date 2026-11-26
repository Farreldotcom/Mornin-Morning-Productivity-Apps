import type { StaticImageData } from 'next/image';

import avocadoToastImg from '@/src/assets/images/breakfast_avocado_toast_1795676852630.jpg';
import scrambledEggsImg from '@/src/assets/images/breakfast_scrambled_eggs_1795676852830.jpg';
import bananaPancakesImg from '@/src/assets/images/breakfast_banana_pancakes_1795676853440.jpg';
import greekYogurtImg from '@/src/assets/images/breakfast_greek_yogurt_1795676854783.jpg';
import overnightOatsImg from '@/src/assets/images/breakfast_overnight_oats_1795676855300.jpg';
import fruitSmoothieImg from '@/src/assets/images/breakfast_fruit_smoothie_1795676854867.jpg';
import friedRiceImg from '@/src/assets/images/breakfast_fried_rice_1795676855656.jpg';
import chickenPorridgeImg from '@/src/assets/images/breakfast_chicken_porridge_1795676856428.jpg';
import eggSandwichImg from '@/src/assets/images/breakfast_egg_sandwich_1795676856664.jpg';
import peanutButterToastImg from '@/src/assets/images/breakfast_peanut_butter_toast_1795676857802.jpg';
import vegetableOmeletteImg from '@/src/assets/images/breakfast_vegetable_omelette_1795676857673.jpg';
import fruitBowlImg from '@/src/assets/images/breakfast_fruit_bowl_1795676857780.jpg';

export const BREAKFAST_IMAGES: Record<string, StaticImageData> = {
  'avocado-toast': avocadoToastImg,
  'scrambled-eggs': scrambledEggsImg,
  'banana-pancakes': bananaPancakesImg,
  'greek-yogurt': greekYogurtImg,
  'overnight-oats': overnightOatsImg,
  'fruit-smoothie': fruitSmoothieImg,
  'indonesian-fried-rice': friedRiceImg,
  'chicken-porridge': chickenPorridgeImg,
  'egg-sandwich': eggSandwichImg,
  'peanut-butter-toast': peanutButterToastImg,
  'vegetable-omelette': vegetableOmeletteImg,
  'fresh-fruit-bowl': fruitBowlImg,
};
