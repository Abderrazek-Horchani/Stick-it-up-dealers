import { NextRequest, NextResponse } from 'next/server';
import { readdirSync, statSync } from 'fs';
import { join, sep } from 'path';

export const dynamic = 'force-dynamic';


interface Category {
  name: string;
  path: string;
  subcategories?: Category[];
}

interface Sticker {
  name: string;
  category: string;
  imagePath: string;
}

function scanStickersDirectory(basePath: string): {
  categories: Category[];
  stickers: Sticker[];
} {
  const categories: Category[] = [];
  const stickers: Sticker[] = [];

  function scanDirectory(dirPath: string, parentPath = ''): Category[] {
    const items = readdirSync(dirPath);
    const localCategories: Category[] = [];

    items.forEach((item) => {
      const fullPath = join(dirPath, item);
      const relativePath = join(parentPath, item);
      const normalizedPath = relativePath.split(sep).join('/');
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        const subcategories = scanDirectory(fullPath, relativePath);
        const category: Category = {
          name: item,
          path: normalizedPath,
          subcategories: subcategories.length > 0 ? subcategories : undefined,
        };
        localCategories.push(category);
        if (parentPath === '') {
          categories.push(category); // Only add top-level categories to the main array
        }
      } else if (item.match(/\.(png|jpe?g|gif)$/i)) {
        const name = item.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        stickers.push({
          name,
          category: normalizedPath.split('/').slice(0, -1).join('/'),
          imagePath: `/stickers/${normalizedPath}`,
        });
      }
    });

    return localCategories;
  }

  try {
    scanDirectory(basePath);
  } catch (error) {
    console.error('Error scanning stickers directory:', error);
  }

  return { categories, stickers };
}

export async function GET(request: NextRequest) {
  try {
    const stickersPath = join(process.cwd(), 'public', 'stickers');
    const data = scanStickersDirectory(stickersPath);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/stickers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}