import { getLatestUpdatedManhwa, getTotalManhwaCount } from '@/lib/queries/manhwa';
import { NextRequest, NextResponse } from 'next/server';

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(0, Number(searchParams.get('page') ?? '0'));

  const [manhwa, totalCount] = await Promise.all([
    getLatestUpdatedManhwa(page, PAGE_SIZE),
    getTotalManhwaCount(),
  ]);

  const loaded = (page + 1) * PAGE_SIZE;
  const hasMore = loaded < totalCount;

  return NextResponse.json({ manhwa, hasMore });
}
