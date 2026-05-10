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

export type TimeSlot = {
  id: string;
  startTime: string;
  endTime: string;
  displayText: string;
  isBooked: boolean;
  bookedBy?: string;
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

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatTime12Hour(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  return `${hours}:${minutes} ${ampm}`;
}

export function generateTimeSlots(existingRequests: any[] = [], selectedDate: string, selectedLabId: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = 9; // 9:00 AM
  const endHour = 18; // 6:00 PM
  const slotDuration = 50; // 50 minutes
  const breakDuration = 10; // 10 minutes break between slots
  
  // Guard against undefined existingRequests
  if (!existingRequests || !Array.isArray(existingRequests)) {
    return [];
  }
  
  // Filter existing requests for the selected date and lab
  const bookedSlots = existingRequests.filter(req => 
    req.lab?._id === selectedLabId && 
    req.requestDate === selectedDate && 
    (req.status === 'approved' || req.status === 'pending')
  );

  
  // Generate slots from 9:00 AM to 6:00 PM
  let currentTime = new Date();
  currentTime.setHours(startHour, 0, 0, 0);
  
  while (currentTime.getHours() < endHour || (currentTime.getHours() === endHour && currentTime.getMinutes() === 0)) {
    const startTime = new Date(currentTime);
    const endTime = new Date(currentTime.getTime() + slotDuration * 60000);
    
    // Format times as HH:MM
    const startTimeStr = formatTime(startTime);
    const endTimeStr = formatTime(endTime);
    const slotId = `${startTimeStr}-${endTimeStr}`;
    
    // Check if this slot is booked and get who booked it
    let isBooked = false;
    let bookedBy = '';
    
    const overlappingRequest = bookedSlots.find(req => {
      const reqStart = new Date(req.startTime);
      const reqEnd = new Date(req.endTime);
      const slotStart = new Date(`${selectedDate}T${startTimeStr}`);
      const slotEnd = new Date(`${selectedDate}T${endTimeStr}`);
      
      // Check for overlap - more robust check
      const hasOverlap = (slotStart < reqEnd && slotEnd > reqStart);
      
      return hasOverlap;
    });
    
    if (overlappingRequest) {
      isBooked = true;
      bookedBy = overlappingRequest.requestedBy?.fullName || 'Unknown user';
    }
    
    slots.push({
      id: slotId,
      startTime: startTimeStr,
      endTime: endTimeStr,
      displayText: `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`,
      isBooked,
      bookedBy
    });
    
    // Move to next slot
    currentTime = new Date(endTime.getTime() + breakDuration * 60000);
    
    // Stop if next slot would go beyond 6:00 PM
    if (currentTime.getHours() > endHour || (currentTime.getHours() === endHour && currentTime.getMinutes() > 0)) {
      break;
    }
  }
  
  return slots;
}
