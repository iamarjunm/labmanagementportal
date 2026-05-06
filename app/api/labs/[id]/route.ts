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
  images?: string[];
};

export async function PATCH(request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const session = getSessionFromRequest(request as never);
  if (!session) {
    return NextResponse.json({error: 'Unauthorized.'}, {status: 401});
  }

  const isSuperAdmin = session.role === 'super_admin';
  const isAssignedAdmin = session.role === 'admin' && session.assignedLabIds.includes(id);

  if (!isSuperAdmin && !isAssignedAdmin) {
    return NextResponse.json({error: 'Only super admins or assigned admins can edit this lab.'}, {status: 403});
  }
  const body = (await request.json().catch(() => null)) as UpdateLabBody | null;

  if (!body) {
    return NextResponse.json({error: 'Missing request body.'}, {status: 400});
  }

  let updateSet: any = {};
  if (isSuperAdmin) {
    updateSet = {
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
      ...(body.images !== undefined ? {
        images: body.images.filter(Boolean).map((assetId) => ({
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetId,
          },
        })),
      } : {}),
    };
  } else {
    // Only allow assigned admins to update isActive
    if (body.isActive !== undefined) {
      updateSet.isActive = body.isActive;
    }
  }

  if (Object.keys(updateSet).length === 0) {
    return NextResponse.json({ok: true});
  }

  await sanityMutate([
    {
      patch: {
        id,
        set: updateSet,
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
