import {NextResponse} from 'next/server';
import {createDocumentId, groqString, sanityMutate, sanityQuery} from '@/lib/sanity';
import {getSessionFromRequest} from '@/lib/auth';

type CreateUserBody = {
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  role?: 'super_admin' | 'admin' | 'user';
  assignedLabIds?: string[];
};

type UpdateUserBody = CreateUserBody & {
  isActive?: boolean;
};

export async function GET(request: Request) {
  const session = getSessionFromRequest(request as never);
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({users: []}, {status: 403});
  }

  const users = await sanityQuery<Array<{
    _id: string;
    fullName: string;
    username: string;
    email?: string;
    role: 'super_admin' | 'admin' | 'user';
    isActive?: boolean;
    assignedLabs?: Array<{_id: string; labName: string}>;
  }>>(`
    *[_type == "portalUser"] | order(fullName asc){
      _id,
      fullName,
      username,
      email,
      role,
      isActive,
      assignedLabs[]->{_id, labName}
    }
  `);

  return NextResponse.json({users});
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request as never);
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({error: 'Only super admins can add users.'}, {status: 403});
  }

  const body = (await request.json().catch(() => null)) as CreateUserBody | null;

  const fullName = body?.fullName?.trim() ?? '';
  const username = body?.username?.trim().toLowerCase() ?? '';
  const password = body?.password ?? '';
  const role = body?.role ?? 'user';

  if (!fullName || !username || !password) {
    return NextResponse.json({error: 'Full name, username, and password are required.'}, {status: 400});
  }

  if (password.length < 6) {
    return NextResponse.json({error: 'Password must be at least 6 characters.'}, {status: 400});
  }

  const existing = await sanityQuery<{_id: string} | null>(`
    *[_type == "portalUser" && (lower(username) == ${groqString(username)} || lower(email) == ${groqString((body?.email ?? '').trim().toLowerCase())})][0]{_id}
  `);

  if (existing) {
    return NextResponse.json({error: 'A user with this username or email already exists.'}, {status: 409});
  }

  const assignedLabRefs =
    role === 'admin'
      ? (body?.assignedLabIds ?? []).filter(Boolean).map((id) => ({_type: 'reference', _ref: id}))
      : [];

  await sanityMutate([
    {
      create: {
        _id: createDocumentId('portal-user', username),
        _type: 'portalUser',
        fullName,
        username,
        email: body?.email?.trim() || undefined,
        password,
        role,
        isActive: true,
        assignedLabs: assignedLabRefs,
      },
    },
  ]);

  return NextResponse.json({ok: true});
}
