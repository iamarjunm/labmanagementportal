import {NextResponse} from 'next/server';
import {getSessionFromRequest} from '@/lib/auth';
import {sanityMutate} from '@/lib/sanity';

export async function PATCH(request: Request) {
  const session = getSessionFromRequest(request as never);
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({error: 'Only super admins can bulk update labs.'}, {status: 403});
  }

  const body = (await request.json().catch(() => null)) as {ids?: string[]; isActive?: boolean} | null;
  const ids = (body?.ids ?? []).filter(Boolean);

  if (!ids.length) {
    return NextResponse.json({error: 'No lab ids provided.'}, {status: 400});
  }
  if (body?.isActive === undefined) {
    return NextResponse.json({error: 'isActive status not provided.'}, {status: 400});
  }

  await sanityMutate(
    ids.map((id) => ({
      patch: {
        id,
        set: {isActive: body.isActive},
      },
    }))
  );

  return NextResponse.json({ok: true, updated: ids.length});
}
