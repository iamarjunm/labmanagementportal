import {NextResponse} from 'next/server';
import {groqString, sanityMutate, sanityQuery} from '@/lib/sanity';
import {getSessionFromRequest} from '@/lib/auth';

type UpdateUserBody = {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: 'super_admin' | 'admin' | 'user';
  isActive?: boolean;
  assignedLabIds?: string[];
};

export async function PATCH(request: Request, {params}: {params: Promise<{id: string}>}) {
  const session = getSessionFromRequest(request as never);
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({error: 'Only super admins can edit users.'}, {status: 403});
  }

  const {id} = await params;
  const body = (await request.json().catch(() => null)) as UpdateUserBody | null;
  if (!body) {
    return NextResponse.json({error: 'Missing request body.'}, {status: 400});
  }

  const currentUser = await sanityQuery<{
    _id: string;
    role: 'super_admin' | 'admin' | 'user';
  } | null>(`
    *[_type == "portalUser" && _id == ${groqString(id)}][0]{_id, role}
  `);

  if (!currentUser) {
    return NextResponse.json({error: 'User not found.'}, {status: 404});
  }

  const nextRole = body.role ?? currentUser.role;
  const assignedLabRefs =
    nextRole === 'admin'
      ? (body.assignedLabIds ?? []).filter(Boolean).map((labId) => ({_type: 'reference', _ref: labId}))
      : [];

  await sanityMutate([
    {
      patch: {
        id,
        set: {
          ...(body.fullName !== undefined ? {fullName: body.fullName || null} : {}),
          ...(body.username !== undefined ? {username: body.username || null} : {}),
          ...(body.email !== undefined ? {email: body.email || null} : {}),
          ...(body.password !== undefined ? {password: body.password || null} : {}),
          ...(body.role !== undefined ? {role: body.role} : {}),
          ...(body.isActive !== undefined ? {isActive: body.isActive} : {}),
          ...(body.role !== undefined || body.assignedLabIds !== undefined ? {assignedLabs: assignedLabRefs} : {}),
        },
      },
    },
  ]);

  return NextResponse.json({ok: true});
}

export async function DELETE(request: Request, {params}: {params: Promise<{id: string}>}) {
  const session = getSessionFromRequest(request as never);
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({error: 'Only super admins can delete users.'}, {status: 403});
  }

  const {id} = await params;
  await sanityMutate([{delete: {id}}]);
  return NextResponse.json({ok: true});
}
