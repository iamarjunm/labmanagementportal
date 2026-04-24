import {NextResponse} from 'next/server';
import {getSessionFromRequest} from '@/lib/auth';
import {sanityMutate} from '@/lib/sanity';

type UpdateLabBody = {
  srNo?: string;
  labName?: string;
  labNumber?: string;
  locationBuildingName?: string;
  departmentName?: string;
  assignedAdminIds?: string[];
  description?: string;
  websiteUrl?: string;
  isActive?: boolean;
};

export async function PATCH(request: Request, {params}: {params: Promise<{id: string}>}) {
  const session = getSessionFromRequest(request as never);
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({error: 'Only super admins can edit labs.'}, {status: 403});
  }

  const {id} = await params;
  const body = (await request.json().catch(() => null)) as UpdateLabBody | null;

  if (!body) {
    return NextResponse.json({error: 'Missing request body.'}, {status: 400});
  }

  await sanityMutate([
    {
      patch: {
        id,
        set: {
          ...(body.srNo !== undefined ? {srNo: body.srNo || null} : {}),
          ...(body.labName !== undefined ? {labName: body.labName || null} : {}),
          ...(body.labNumber !== undefined ? {labNumber: body.labNumber || null} : {}),
          ...(body.locationBuildingName !== undefined ? {locationBuildingName: body.locationBuildingName || null} : {}),
          ...(body.departmentName !== undefined ? {departmentName: body.departmentName || null} : {}),
          ...(body.assignedAdminIds !== undefined
            ? {
                assignedAdmins: (body.assignedAdminIds ?? []).filter(Boolean).map((adminId) => ({
                  _type: 'reference',
                  _ref: adminId,
                })),
              }
            : {}),
          ...(body.description !== undefined ? {description: body.description || null} : {}),
          ...(body.websiteUrl !== undefined ? {websiteUrl: body.websiteUrl || null} : {}),
          ...(body.isActive !== undefined ? {isActive: body.isActive} : {}),
        },
      },
    },
  ]);

  return NextResponse.json({ok: true});
}

export async function DELETE(request: Request, {params}: {params: Promise<{id: string}>}) {
  const session = getSessionFromRequest(request as never);
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({error: 'Only super admins can delete labs.'}, {status: 403});
  }

  const {id} = await params;

  await sanityMutate([
    {
      delete: {id},
    },
  ]);

  return NextResponse.json({ok: true});
}
