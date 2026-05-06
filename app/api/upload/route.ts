import {NextResponse} from 'next/server';
import {getSessionFromRequest} from '@/lib/auth';
import {sanityUploadImage} from '@/lib/sanity';

export async function POST(request: Request) {
  const session = getSessionFromRequest(request as never);
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({error: 'Only super admins can upload files.'}, {status: 403});
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({error: 'No file provided.'}, {status: 400});
    }

    const result = await sanityUploadImage(file, file.name);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {error: error instanceof Error ? error.message : 'Upload failed.'},
      {status: 500},
    );
  }
}
