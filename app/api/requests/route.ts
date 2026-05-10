import {NextResponse} from 'next/server';
import {groqString, sanityMutate, sanityQuery} from '@/lib/sanity';
import {getSessionFromRequest} from '@/lib/auth';

type CreateRequestBody = {
  labId?: string;
  requestDate?: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
};

export async function GET(request: Request) {
  const session = getSessionFromRequest(request as never);
  if (!session) {
    return NextResponse.json({requests: []}, {status: 401});
  }

  const assignedLabIds = JSON.stringify(session.assignedLabIds ?? []);
  const requests = await sanityQuery<Array<{
    _id: string;
    requestDate?: string;
    startTime?: string;
    endTime?: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedAt?: string;
    reviewNote?: string;
    requestedBy?: {_id: string; fullName: string; username: string};
    reviewedBy?: {_id: string; fullName: string; username: string};
    lab?: {
      _id: string;
      labName?: string;
      labNumber?: string;
      departmentName?: string;
      assignedAdmins?: Array<{_id: string; fullName: string; username: string}>;
    };
  }>>(
    session.role === 'super_admin'
      ? `*[_type == "accessRequest"] | order(requestedAt desc){
          _id,
          requestDate,
          startTime,
          endTime,
          reason,
          status,
          reviewedAt,
          reviewNote,
          requestedBy->{_id, fullName, username},
          reviewedBy->{_id, fullName, username},
          lab->{_id, labName, labNumber, departmentName, assignedAdmins[]->{_id, fullName, username}}
        }`
      : session.role === 'admin'
        ? `*[_type == "accessRequest" && lab._ref in ${assignedLabIds}] | order(requestedAt desc){
            _id,
            requestDate,
            startTime,
            endTime,
            reason,
            status,
            reviewedAt,
            reviewNote,
            requestedBy->{_id, fullName, username},
            reviewedBy->{_id, fullName, username},
            lab->{_id, labName, labNumber, departmentName, assignedAdmins[]->{_id, fullName, username}}
          }`
        : `*[_type == "accessRequest" && requestedBy._ref == ${groqString(session.id)}] | order(requestedAt desc){
            _id,
            requestDate,
            startTime,
            endTime,
            reason,
            status,
            reviewedAt,
            reviewNote,
            requestedBy->{_id, fullName, username},
            reviewedBy->{_id, fullName, username},
            lab->{_id, labName, labNumber, departmentName, assignedAdmins[]->{_id, fullName, username}}
          }`,
  );

  return NextResponse.json({requests});
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request as never);
  if (!session) {
    return NextResponse.json({error: 'Not authenticated.'}, {status: 401});
  }

  const body = (await request.json().catch(() => null)) as CreateRequestBody | null;
  if (!body?.labId || !body.requestDate || !body.startTime || !body.endTime || !body.reason) {
    return NextResponse.json({error: 'Lab, request date, start time, end time, and reason are required.'}, {status: 400});
  }

  // Check for existing bookings that overlap with the requested time slot
  const existingRequests = await sanityQuery<Array<{
    _id: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'approved' | 'rejected';
    lab?: {_id: string};
    requestDate: string;
  }>>(
    `*[_type == "accessRequest" && lab._ref == ${groqString(body.labId)} && requestDate == ${groqString(body.requestDate)} && status in ["pending", "approved"]]{
      _id,
      startTime,
      endTime,
      status,
      lab->{_id},
      requestDate
    }`
  );

  // Check for overlaps
  const requestedStart = new Date(body.startTime);
  const requestedEnd = new Date(body.endTime);
  
  const hasOverlap = existingRequests.some(req => {
    const reqStart = new Date(req.startTime);
    const reqEnd = new Date(req.endTime);
    return (requestedStart < reqEnd && requestedEnd > reqStart);
  });

  if (hasOverlap) {
    return NextResponse.json({error: 'This time slot is already booked. Please select a different time.'}, {status: 409});
  }

  await sanityMutate([
    {
      create: {
        _type: 'accessRequest',
        requestedBy: {_type: 'reference', _ref: session.id},
        lab: {_type: 'reference', _ref: body.labId},
        requestDate: body.requestDate,
        startTime: body.startTime,
        endTime: body.endTime,
        reason: body.reason,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      },
    },
  ]);

  return NextResponse.json({ok: true});
}
