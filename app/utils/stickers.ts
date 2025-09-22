export interface Category {
  name: string;
  path: string;
  subcategories?: Category[];
}

export interface Sticker {
  name: string;
  category: string;
  imagePath: string;
}

export function filterStickersByCategory(
  stickers: Sticker[],
  selectedCategory: string
): Sticker[] {
  if (!selectedCategory) return stickers;
  const normalizedCategory = selectedCategory.replace(/\\/g, '/');
  return stickers.filter(
    (sticker) => sticker.category === normalizedCategory || sticker.category.startsWith(`${normalizedCategory}/`)
  );
}

export function getStickers(): Sticker[] {
  return [
    // Adventure Time stickers
    {
      name: "Adventure Time 1",
      category: "Adventure Time",
      imagePath: "/stickers/Adventure Time/adventure_time_001.png"
    },
    {
      name: "Adventure Time 2",
      category: "Adventure Time",
      imagePath: "/stickers/Adventure Time/adventure_time_002.png"
    },
    {
      name: "Adventure Time 3",
      category: "Adventure Time",
      imagePath: "/stickers/Adventure Time/adventure_time_003.png"
    },
    // Add more sticker data as needed
    // You can add more categories and stickers here
  ];
}