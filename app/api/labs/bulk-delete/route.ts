import {NextResponse} from 'next/server';
import {getSessionFromRequest} from '@/lib/auth';
import {sanityMutate} from '@/lib/sanity';

export async function DELETE(request: Request) {
  const session = getSessionFromRequest(request as never);
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({error: 'Only super admins can delete labs.'}, {status: 403});
  }

  const body = (await request.json().catch(() => null)) as {ids?: string[]} | null;
  const ids = (body?.ids ?? []).filter(Boolean);

  if (!ids.length) {
    return NextResponse.json({error: 'No lab ids provided.'}, {status: 400});
  }

  await sanityMutate(ids.map((id) => ({delete: {id}})));
  return NextResponse.json({ok: true, deleted: ids.length});
}
