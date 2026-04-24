import {NextResponse} from 'next/server';
import {getSessionFromRequest} from '@/lib/auth';
import {groqString, sanityQuery} from '@/lib/sanity';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request as never);

  if (!session) {
    return NextResponse.json({user: null}, {status: 401});
  }

  const user = await sanityQuery<{
    _id: string;
    fullName: string;
    username: string;
    email?: string;
    role: 'super_admin' | 'admin' | 'user';
    assignedLabs?: Array<{_id: string; labName: string}>;
  } | null>(`
    *[_type == "portalUser" && _id == ${groqString(session.id)}][0]{
      _id,
      fullName,
      username,
      email,
      role,
      assignedLabs[]->{_id, labName}
    }
  `);

  return NextResponse.json({
    user: user
      ? {
          id: user._id,
          name: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          assignedLabs: user.assignedLabs ?? [],
        }
      : null,
  });
}