import {NextResponse} from 'next/server';
import {createSessionCookie, verifyPassword} from '@/lib/auth';
import {groqString, sanityQuery} from '@/lib/sanity';

type PortalUser = {
  _id: string;
  fullName: string;
  username: string;
  email?: string;
  role: 'super_admin' | 'admin' | 'user';
  password?: string;
  passwordHash?: string;
  passwordSalt?: string;
  assignedLabs?: Array<{_id: string}>;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {username?: string; password?: string} | null;

  if (!body?.username || !body.password) {
    return NextResponse.json({error: 'Username and password are required.'}, {status: 400});
  }

  const username = body.username.trim().toLowerCase();

  const user = await sanityQuery<PortalUser | null>(`
    *[_type == "portalUser" && isActive == true && (lower(username) == ${groqString(username)} || lower(email) == ${groqString(username)})][0]{
      _id,
      fullName,
      username,
      email,
      role,
      password,
      passwordHash,
      passwordSalt,
      assignedLabs[]->{_id}
    }
  `);

  if (!user) {
    return NextResponse.json({error: 'Invalid credentials.'}, {status: 401});
  }

  const hasHashedPassword = Boolean(user.passwordHash && user.passwordSalt);
  const isValid = hasHashedPassword
    ? verifyPassword(body.password, user.passwordSalt as string, user.passwordHash as string)
    : user.password === body.password;

  if (!isValid) {
    return NextResponse.json({error: 'Invalid credentials.'}, {status: 401});
  }

  const session = createSessionCookie({
    id: user._id,
    name: user.fullName,
    username: user.username,
    email: user.email,
    role: user.role,
    assignedLabIds: user.assignedLabs?.map((lab) => lab._id) ?? [],
  });

  const response = NextResponse.json({
    user: {
      id: user._id,
      name: user.fullName,
      username: user.username,
      email: user.email,
      role: user.role,
      assignedLabIds: user.assignedLabs?.map((lab) => lab._id) ?? [],
    },
  });

  response.cookies.set({
    name: 'lab_portal_session',
    value: session,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  return response;
}