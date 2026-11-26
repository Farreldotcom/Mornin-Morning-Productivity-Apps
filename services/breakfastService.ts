import type { BreakfastItem, PrepTimeFilter } from '@/types';

export const BREAKFAST_DATABASE: BreakfastItem[] = [
  {
    id: 'avocado-toast',
    name: 'Avocado Toast',
    description:
      'Crisp sourdough layered with smashed ripe avocado, a soft-poached egg, flaky sea salt, and bright lemon zest.',
    imageKey: 'avocado-toast',
    preparationTime: 8,
    timeBucket: '5-10',
    difficulty: 'Easy',
    ingredients: ['Sourdough bread', 'Ripe avocado', 'Egg', 'Lemon juice', 'Flaky sea salt'],
    category: 'Savory',
  },
  {
    id: 'scrambled-eggs',
    name: 'Scrambled Eggs & Toast',
    description:
      'Slow-folded velvety eggs finished with fresh chives alongside warm buttered country toast.',
    imageKey: 'scrambled-eggs',
    preparationTime: 7,
    timeBucket: '5-10',
    difficulty: 'Easy',
    ingredients: ['2 large eggs', 'Butter', 'Country bread', 'Fresh chives', 'Black pepper'],
    category: 'Savory',
  },
  {
    id: 'banana-pancakes',
    name: 'Banana Pancakes',
    description:
      'Light, naturally sweet oat-banana pancakes topped with toasted walnuts and a gentle drizzle of maple syrup.',
    imageKey: 'banana-pancakes',
    preparationTime: 15,
    timeBucket: '10-20',
    difficulty: 'Moderate',
    ingredients: ['Ripe banana', 'Rolled oats', 'Egg', 'Walnuts', 'Maple syrup'],
    category: 'Sweet',
  },
  {
    id: 'greek-yogurt',
    name: 'Greek Yogurt Bowl',
    description:
      'Thick strained yogurt swirled with raw honey, toasted granola clusters, blueberries, and fresh seasonal figs.',
    imageKey: 'greek-yogurt',
    preparationTime: 4,
    timeBucket: 'under-5',
    difficulty: 'Easy',
    ingredients: ['Greek yogurt', 'Oat granola', 'Blueberries', 'Fresh figs', 'Raw honey'],
    category: 'Fresh',
  },
  {
    id: 'overnight-oats',
    name: 'Overnight Oats',
    description:
      'Creamy chia-soaked rolled oats chilled overnight, finished with sliced strawberries, almonds, and warm cinnamon.',
    imageKey: 'overnight-oats',
    preparationTime: 3,
    timeBucket: 'under-5',
    difficulty: 'Easy',
    ingredients: ['Rolled oats', 'Chia seeds', 'Almond milk', 'Strawberries', 'Cinnamon'],
    category: 'Sweet',
  },
  {
    id: 'fruit-smoothie',
    name: 'Fruit Smoothie',
    description:
      'Chilled blend of mixed berries, ripe mango, and yogurt for an effortless, energizing start on busy mornings.',
    imageKey: 'fruit-smoothie',
    preparationTime: 4,
    timeBucket: 'under-5',
    difficulty: 'Easy',
    ingredients: ['Mixed berries', 'Mango chunks', 'Yogurt or oat milk', 'Chia seeds'],
    category: 'Fresh',
  },
  {
    id: 'indonesian-fried-rice',
    name: 'Indonesian Fried Rice',
    description:
      'Fragrant morning nasi goreng tossed with sweet soy, garlic, shallots, and a crispy-edged sunny egg on top.',
    imageKey: 'indonesian-fried-rice',
    preparationTime: 14,
    timeBucket: '10-20',
    difficulty: 'Moderate',
    ingredients: ['Day-old jasmine rice', 'Egg', 'Sweet soy sauce', 'Shallots & garlic', 'Cucumber'],
    category: 'Warm Bowl',
  },
  {
    id: 'chicken-porridge',
    name: 'Chicken Porridge',
    description:
      'Comforting savory rice porridge garnished with shredded poached chicken, crispy shallots, scallions, and golden crisps.',
    imageKey: 'chicken-porridge',
    preparationTime: 16,
    timeBucket: '10-20',
    difficulty: 'Moderate',
    ingredients: ['Rice porridge', 'Shredded chicken', 'Crispy shallots', 'Scallions', 'Soy broth'],
    category: 'Warm Bowl',
  },
  {
    id: 'egg-sandwich',
    name: 'Egg Sandwich',
    description:
      'Warm toasted brioche filled with a soft folded omelette, melted aged cheddar, and crisp baby spinach.',
    imageKey: 'egg-sandwich',
    preparationTime: 8,
    timeBucket: '5-10',
    difficulty: 'Easy',
    ingredients: ['Brioche bun', '2 eggs', 'Aged cheddar', 'Baby spinach', 'Butter'],
    category: 'Savory',
  },
  {
    id: 'peanut-butter-toast',
    name: 'Peanut Butter Toast',
    description:
      'Toasted whole-grain bread layered with creamy natural peanut butter, sliced banana, chia seeds, and honey.',
    imageKey: 'peanut-butter-toast',
    preparationTime: 4,
    timeBucket: 'under-5',
    difficulty: 'Easy',
    ingredients: ['Whole-grain bread', 'Natural peanut butter', 'Banana', 'Chia seeds', 'Honey'],
    category: 'Sweet',
  },
  {
    id: 'vegetable-omelette',
    name: 'Vegetable Omelette',
    description:
      'Tender golden omelette folded around sautéed baby spinach, sweet cherry tomatoes, and fresh garden herbs.',
    imageKey: 'vegetable-omelette',
    preparationTime: 9,
    timeBucket: '5-10',
    difficulty: 'Easy',
    ingredients: ['2–3 eggs', 'Spinach', 'Cherry tomatoes', 'Fresh parsley', 'Olive oil'],
    category: 'Savory',
  },
  {
    id: 'fresh-fruit-bowl',
    name: 'Fresh Fruit Bowl',
    description:
      'Bright morning assortment of diced mango, kiwi, dragon fruit, and berries lifted with fresh mint leaves.',
    imageKey: 'fresh-fruit-bowl',
    preparationTime: 5,
    timeBucket: 'under-5',
    difficulty: 'Easy',
    ingredients: ['Mango', 'Kiwi', 'Dragon fruit', 'Fresh berries', 'Mint leaves'],
    category: 'Fresh',
  },
];

export function filterBreakfasts(filter: PrepTimeFilter): BreakfastItem[] {
  if (filter === 'all') return BREAKFAST_DATABASE;
  return BREAKFAST_DATABASE.filter((item) => item.timeBucket === filter);
}

export function pickNextBreakfast(
  items: BreakfastItem[],
  currentId?: string
): BreakfastItem {
  if (items.length === 0) return BREAKFAST_DATABASE[0];
  if (items.length === 1) return items[0];
  const candidates = items.filter((item) => item.id !== currentId);
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}
