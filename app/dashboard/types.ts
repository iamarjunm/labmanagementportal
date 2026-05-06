export type PortalUser = {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: 'super_admin' | 'admin' | 'user';
  assignedLabs?: Array<{_id: string; labName: string}>;
};

export type Lab = {
  _id: string;
  srNo?: string;
  labName?: string;
  labNumber?: string;
  locationBuildingName?: string;
  departmentName?: string;
  description?: string;
  websiteUrl?: string;
  isActive?: boolean;
  images?: Array<{_key?: string; asset: {_id: string; url: string}}>;
  assignedAdmins?: Array<{_id: string; fullName: string; username: string}>;
};

export type UserRecord = {
  _id: string;
  fullName: string;
  username: string;
  email?: string;
  role: 'super_admin' | 'admin' | 'user';
  isActive?: boolean;
  assignedLabs?: Array<{_id: string; labName: string}>;
};

export type AccessRequest = {
  _id: string;
  requestDate?: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy?: {_id: string; fullName: string; username: string};
  reviewedBy?: {_id: string; fullName: string; username: string};
  reviewNote?: string;
  reviewedAt?: string;
  lab?: {
    _id: string;
    labName?: string;
    labNumber?: string;
    departmentName?: string;
    assignedAdmins?: Array<{_id: string; fullName: string; username: string}>;
  };
};

export type TabKey = 'overview' | 'labs' | 'users' | 'requests' | 'import';

export type LabDraft = {
  srNo: string;
  labName: string;
  labNumber: string;
  locationBuildingName: string;
  departmentName: string;
  description: string;
  websiteUrl: string;
  isActive: boolean;
  existingImages: Array<{assetId: string; url: string}>;
  newFiles: File[];
  assignedAdminIds: string[];
};

export type UserDraft = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'user';
  isActive: boolean;
  assignedLabIds: string[];
};

export type RequestDraft = {
  labId: string;
  requestDate: string;
  startTime: string;
  endTime: string;
  reason: string;
};

export type ReviewDraft = {
  requestId: string;
  status: 'approved' | 'rejected' | '';
  reviewNote: string;
};

export const emptyLabDraft: LabDraft = {
  srNo: '',
  labName: '',
  labNumber: '',
  locationBuildingName: '',
  departmentName: '',
  description: '',
  websiteUrl: '',
  isActive: true,
  existingImages: [],
  newFiles: [],
  assignedAdminIds: [],
};

export const emptyUserDraft: UserDraft = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  role: 'user',
  isActive: true,
  assignedLabIds: [],
};

export const emptyRequestDraft: RequestDraft = {
  labId: '',
  requestDate: '',
  startTime: '',
  endTime: '',
  reason: '',
};

export const emptyReviewDraft: ReviewDraft = {
  requestId: '',
  status: '',
  reviewNote: '',
};

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}
