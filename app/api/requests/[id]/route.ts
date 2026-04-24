import {NextResponse} from 'next/server';
import {groqString, sanityMutate, sanityQuery} from '@/lib/sanity';
import {getSessionFromRequest} from '@/lib/auth';

type UpdateRequestBody = {
  status?: 'approved' | 'rejected';
  reviewNote?: string;
};

export async function PATCH(request: Request, {params}: {params: Promise<{id: string}>}) {
  const session = getSessionFromRequest(request as never);
  if (!session || session.role === 'user') {
    return NextResponse.json({error: 'Not authorized.'}, {status: 403});
  }

  const {id} = await params;
  const body = (await request.json().catch(() => null)) as UpdateRequestBody | null;
  if (!body?.status) {
    return NextResponse.json({error: 'Status is required.'}, {status: 400});
  }

  const currentRequest = await sanityQuery<{
    _id: string;
    lab?: {_id: string};
  } | null>(`
    *[_type == "accessRequest" && _id == ${groqString(id)}][0]{_id, lab->{_id}}
  `);

  if (!currentRequest) {
    return NextResponse.json({error: 'Request not found.'}, {status: 404});
  }

  if (session.role === 'admin' && !session.assignedLabIds.includes(currentRequest.lab?._id ?? '')) {
    return NextResponse.json({error: 'You cannot review requests for labs not assigned to you.'}, {status: 403});
  }

  await sanityMutate([
    {
      patch: {
        id,
        set: {
          status: body.status,
          reviewedBy: {_type: 'reference', _ref: session.id},
          reviewedAt: new Date().toISOString(),
          reviewNote: body.reviewNote || null,
        },
      },
    },
  ]);

  return NextResponse.json({ok: true});
}
