import { NextResponse } from 'next/server';
import { BUILD_INFO } from '../../build-info';

export function GET() {
  return NextResponse.json(BUILD_INFO);
}
