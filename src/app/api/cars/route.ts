import { NextRequest, NextResponse } from "next/server";
import { cars } from "../../data/cars";
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  let r = [...cars];
  const s = p.get("status"); if (s && s !== "all") r = r.filter(c => c.status === s);
  const f = p.get("fuel");   if (f) r = r.filter(c => c.fuel === f);
  const b = p.get("budget"); if (b) { const m: Record<string,string> = {"<2000":"< 2000 €","2000-4000":"2000-4000 €","4000+":"≥ 4000 €"}; const t = m[b]; if (t) r = r.filter(c => c.budgetTag === t); }
  return NextResponse.json({ count: r.length, cars: r, updatedAt: new Date().toISOString() });
}
