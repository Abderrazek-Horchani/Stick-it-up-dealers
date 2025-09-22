export interface StickerRequest {
  name: string;
  category: string;
  quantity: number;
}

export interface RestockRequestBody {
  items?: StickerRequest[];
  stickers?: StickerRequest[];
}