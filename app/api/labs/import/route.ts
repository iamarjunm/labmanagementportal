import {NextResponse} from 'next/server';
import {getSessionFromRequest} from '@/lib/auth';
import {createDocumentId, sanityConfig, sanityMutate} from '@/lib/sanity';

type ImportRow = {
  [key: string]: unknown;
  srNo?: string | number;
  'Sr No'?: string | number;
  labName?: string;
  'Lab Name'?: string;
  labNumber?: string | number;
  'Lab Number'?: string | number;
  location?: string;
  'Location/Building name'?: string;
  building?: string;
  departmentName?: string;
  'Department Name'?: string;
  description?: string;
};

const defaultDescription = `Manipal University Jaipur provides a wide range of dedicated physical facilities that support interdisciplinary research across academic disciplines. These include shared high-end laboratories, innovation hubs, and collaborative research centers equipped with advanced instruments and flexible workspaces. Such infrastructure promotes cross-departmental engagement, accelerates knowledge transfer, and enables faculty and students to work collectively on complex, real-world problems.`;

function pickValue(row: ImportRow, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }

  return '';
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request as never);
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({error: 'Only super admins can import labs.'}, {status: 403});
  }

  if (!sanityConfig.token) {
    return NextResponse.json(
      {error: 'Missing SANITY_API_TOKEN or SANITY_WRITE_TOKEN. Add a write token to .env.local before importing.'},
      {status: 500},
    );
  }

  const body = (await request.json().catch(() => null)) as {rows?: ImportRow[]; description?: string} | null;
  const rows = body?.rows ?? [];

  if (!rows.length) {
    return NextResponse.json({error: 'No lab rows provided.'}, {status: 400});
  }

  const mutations = rows
    .filter((row) => pickValue(row, ['labName', 'Lab Name']))
    .map((row, index) => {
      const srNo = pickValue(row, ['srNo', 'Sr No']);
      const labName = pickValue(row, ['labName', 'Lab Name']);
      const labNumber = pickValue(row, ['labNumber', 'Lab Number']);
      const location = pickValue(row, ['location', 'building', 'Location/Building name']);
      const department = pickValue(row, ['departmentName', 'Department Name']);
      const customDescription = pickValue(row, ['description']);
      const idSeed = labNumber || labName || String(index + 1);

      return {
        createOrReplace: {
          _id: createDocumentId('lab', idSeed),
          _type: 'lab',
          srNo: srNo || String(index + 1),
          labName,
          labNumber: labNumber || undefined,
          locationBuildingName: location || undefined,
          departmentName: department || undefined,
          description: customDescription || body?.description?.trim() || defaultDescription,
          orderRank: index + 1,
        },
      };
    });

  if (!mutations.length) {
    return NextResponse.json({error: 'Rows did not contain any lab names.'}, {status: 400});
  }

  const result = await sanityMutate<{results: unknown[]}>(mutations);
  return NextResponse.json({ok: true, imported: result.results.length});
}