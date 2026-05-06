import {NextResponse} from 'next/server';
import {groqString, sanityQuery} from '@/lib/sanity';
import {getSessionFromRequest} from '@/lib/auth';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request as never);

  if (!session) {
    return NextResponse.json({labs: []}, {status: 401});
  }

  const labs = await sanityQuery<Array<{
    _id: string;
    srNo?: string;
    labName: string;
    labNumber?: string;
    locationBuildingName?: string;
    departmentName?: string;
    assignedAdmins?: Array<{_id: string; fullName: string; username: string}>;
    description?: string;
    websiteUrl?: string;
    isActive?: boolean;
    images?: Array<{_key?: string; asset: {_id: string; url: string}}>;
  }>>(
    `*[_type == "lab"] | order(orderRank asc, labName asc){_id, srNo, labName, labNumber, locationBuildingName, departmentName, assignedAdmins[]->{_id, fullName, username}, description, websiteUrl, isActive, images[]{_key, asset->{_id, url}}}`,
  );

  return NextResponse.json({labs});
}