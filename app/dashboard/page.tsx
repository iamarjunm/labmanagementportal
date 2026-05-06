"use client";

import {useEffect, useMemo, useState, type ChangeEvent, type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {HeaderSection} from './components/HeaderSection';
import {OverviewTab} from './components/OverviewTab';
import {LabsTab} from './components/LabsTab';
import {UsersTab} from './components/UsersTab';
import {RequestsTab} from './components/RequestsTab';
import {ImportTab} from './components/ImportTab';
import {LabModal} from './components/LabModal';
import {UserModal} from './components/UserModal';
import {Loader} from './components/Loader';
import {ReviewModal} from './components/ReviewModal';
import {
  emptyLabDraft,
  emptyRequestDraft,
  emptyUserDraft,
  emptyReviewDraft,
  todayString,
  type AccessRequest,
  type Lab,
  type LabDraft,
  type PortalUser,
  type RequestDraft,
  type ReviewDraft,
  type TabKey,
  type UserDraft,
  type UserRecord,
} from './types';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [user, setUser] = useState<PortalUser | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [labModal, setLabModal] = useState<Lab | null>(null);
  const [labDraft, setLabDraft] = useState<LabDraft>(emptyLabDraft);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [userDraft, setUserDraft] = useState<UserDraft>(emptyUserDraft);
  const [requestDraft, setRequestDraft] = useState<RequestDraft>(emptyRequestDraft);
  const [adminUserForm, setAdminUserForm] = useState<UserDraft>(emptyUserDraft);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState<AccessRequest | null>(null);
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft>(emptyReviewDraft);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSavingLab, setIsSavingLab] = useState(false);
  const [isDeletingLabs, setIsDeletingLabs] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isImportingLabs, setIsImportingLabs] = useState(false);
  const [labStatus, setLabStatus] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<Array<Record<string, unknown>>>([]);

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';
  const adminUsers = useMemo(() => users.filter((candidate) => candidate.role === 'admin'), [users]);

  // Calculate assigned labs for admin
  const assignedLabs = useMemo(() => {
    if (!isAdmin || !user?.assignedLabs || user.assignedLabs.length === 0) return [];
    const assignedLabIds = user.assignedLabs.map((lab) => lab._id);
    return labs.filter((lab) => assignedLabIds.includes(lab._id));
  }, [isAdmin, labs, user?.assignedLabs]);

  // Calculate pending requests for admin's labs
  const adminPendingRequests = useMemo(() => {
    if (!isAdmin) return [];
    const assignedLabIds = assignedLabs.map((lab) => lab._id);
    return requests.filter((req) => assignedLabIds.includes(req.lab?._id ?? '') && req.status === 'pending');
  }, [isAdmin, assignedLabs, requests]);

  const visibleTabs = useMemo<Array<{key: TabKey; label: string}>>(() => {
    if (isSuperAdmin) {
      return [
        {key: 'overview', label: 'Overview'},
        {key: 'labs', label: 'Labs'},
        {key: 'users', label: 'Users'},
        {key: 'requests', label: 'Requests'},
        {key: 'import', label: 'Import'},
      ];
    }

    if (isAdmin) {
      return [
        {key: 'overview', label: 'Overview'},
        {key: 'labs', label: 'Labs'},
        {key: 'requests', label: 'Requests'},
      ];
    }

    return [
      {key: 'labs', label: 'Labs'},
      {key: 'requests', label: 'My Requests'},
    ];
  }, [isAdmin, isSuperAdmin]);

  async function parseResponse(response: Response) {
    const raw = await response.text();
    return raw ? JSON.parse(raw) : {};
  }

  async function loadData() {
    try {
      const meResponse = await fetch('/api/auth/me', {cache: 'no-store'});
      if (!meResponse.ok) {
        router.replace('/');
        return;
      }

      const mePayload = (await parseResponse(meResponse)) as {user: PortalUser | null};
      if (!mePayload.user) {
        router.replace('/');
        return;
      }

      setUser(mePayload.user);

      const labsResponse = await fetch('/api/labs', {cache: 'no-store'});
      if (labsResponse.ok) {
        const labsPayload = (await parseResponse(labsResponse)) as {labs: Lab[]};
        setLabs(labsPayload.labs ?? []);
      }

      if (mePayload.user.role === 'super_admin') {
        const usersResponse = await fetch('/api/admin/users', {cache: 'no-store'});
        if (usersResponse.ok) {
          const usersPayload = (await parseResponse(usersResponse)) as {users: UserRecord[]};
          setUsers(usersPayload.users ?? []);
        }
      } else {
        setUsers([]);
      }

      const requestsResponse = await fetch('/api/requests', {cache: 'no-store'});
      if (requestsResponse.ok) {
        const requestsPayload = (await parseResponse(requestsResponse)) as {requests: AccessRequest[]};
        setRequests(requestsPayload.requests ?? []);
      } else {
        setRequests([]);
      }
    } catch (error) {
      setLabStatus(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [router]);

  useEffect(() => {
    if (!visibleTabs.some((tab) => tab.key === activeTab)) {
      setActiveTab(visibleTabs[0]?.key ?? 'labs');
    }
  }, [activeTab, visibleTabs]);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      await loadData();
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', {method: 'POST'});
    router.replace('/');
  }

  function openLabModal(lab: Lab) {
    setLabModal(lab);
    setLabDraft({
      srNo: lab.srNo ?? '',
      labName: lab.labName ?? '',
      labNumber: lab.labNumber ?? '',
      locationBuildingName: lab.locationBuildingName ?? '',
      departmentName: lab.departmentName ?? '',
      description: lab.description ?? '',
      websiteUrl: lab.websiteUrl ?? '',
      isActive: lab.isActive ?? true,
      existingImages: lab.images?.filter(img => img.asset).map((img) => ({assetId: img.asset._id, url: img.asset.url})) ?? [],
      newFiles: [],
      assignedAdminIds: lab.assignedAdmins?.map((admin) => admin._id) ?? [],
    });
    setRequestDraft({
      labId: lab._id,
      requestDate: todayString(),
      startTime: '',
      endTime: '',
      reason: '',
    });
    setRequestStatus(null);
  }

  function closeLabModal() {
    setLabModal(null);
    setRequestDraft(emptyRequestDraft);
    setLabDraft(emptyLabDraft);
  }

  function openEditUser(record: UserRecord) {
    setEditingUser(record);
    setUserDraft({
      fullName: record.fullName ?? '',
      username: record.username ?? '',
      email: record.email ?? '',
      password: '',
      role: record.role,
      isActive: record.isActive ?? true,
      assignedLabIds: record.assignedLabs?.map((lab) => lab._id) ?? [],
    });
    setUserStatus(null);
  }

  function closeUserModal() {
    setEditingUser(null);
    setUserDraft(emptyUserDraft);
  }

  function toggleSelectAllLabs(selected: boolean) {
    setSelectedLabs(selected ? labs.map((lab) => lab._id) : []);
  }

  function toggleCreateUserLabSelection(selected: boolean) {
    setAdminUserForm((prev) => ({
      ...prev,
      assignedLabIds: selected ? labs.map((lab) => lab._id) : [],
    }));
  }

  function toggleEditUserLabSelection(selected: boolean) {
    setUserDraft((prev) => ({
      ...prev,
      assignedLabIds: selected ? labs.map((lab) => lab._id) : [],
    }));
  }

  function toggleLabAdminSelection(selected: boolean) {
    setLabDraft((prev) => ({
      ...prev,
      assignedAdminIds: selected ? adminUsers.map((admin) => admin._id) : [],
    }));
  }

  function setCreateUserRole(nextRole: 'super_admin' | 'admin' | 'user') {
    setAdminUserForm((prev) => ({
      ...prev,
      role: nextRole,
      assignedLabIds: nextRole === 'admin' ? prev.assignedLabIds : [],
    }));
  }

  function setEditUserRole(nextRole: 'super_admin' | 'admin' | 'user') {
    setUserDraft((prev) => ({
      ...prev,
      role: nextRole,
      assignedLabIds: nextRole === 'admin' ? prev.assignedLabIds : [],
    }));
  }

  async function saveLab() {
    if (!labModal || !isSuperAdmin) return;

    setLabStatus(null);
    setIsSavingLab(true);
    try {
      const uploadedAssetIds: string[] = [];
      for (const file of labDraft.newFiles) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) {
          const errPayload = await parseResponse(uploadRes);
          throw new Error(errPayload?.error || 'Failed to upload image.');
        }
        const data = await uploadRes.json();
        uploadedAssetIds.push(data._id);
      }

      const allAssetIds = [
        ...labDraft.existingImages.map((img) => img.assetId),
        ...uploadedAssetIds,
      ];

      const response = await fetch(`/api/labs/${labModal._id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...labDraft,
          images: allAssetIds,
          assignedAdminIds: labDraft.assignedAdminIds,
        }),
      });
      const payload = await parseResponse(response);
      if (!response.ok) {
        setLabStatus(payload?.error ?? 'Failed to update lab.');
        return;
      }

      setLabStatus('Lab updated successfully.');
      closeLabModal();
      await loadData();
    } finally {
      setIsSavingLab(false);
    }
  }

  async function deleteLab(id: string) {
    if (!confirm('Delete this lab?')) return;

    setIsDeletingLabs(true);
    try {
      const response = await fetch(`/api/labs/${id}`, {method: 'DELETE'});
      const payload = await parseResponse(response);
      if (!response.ok) {
        setLabStatus(payload?.error ?? 'Failed to delete lab.');
        return;
      }

      setLabStatus('Lab deleted successfully.');
      await loadData();
    } finally {
      setIsDeletingLabs(false);
    }
  }

  async function deleteSelectedLabs() {
    if (!selectedLabs.length) return;
    if (!confirm(`Delete ${selectedLabs.length} selected labs?`)) return;

    setIsDeletingLabs(true);
    try {
      const response = await fetch('/api/labs/bulk-delete', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ids: selectedLabs}),
      });
      const payload = await parseResponse(response);
      if (!response.ok) {
        setLabStatus(payload?.error ?? 'Failed to delete labs.');
        return;
      }

      setSelectedLabs([]);
      setLabStatus(`Deleted ${payload.deleted ?? selectedLabs.length} labs.`);
      await loadData();
    } finally {
      setIsDeletingLabs(false);
    }
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUserStatus(null);
    setIsCreatingUser(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...adminUserForm,
          assignedLabIds: adminUserForm.role === 'admin' ? adminUserForm.assignedLabIds : [],
        }),
      });
      const payload = await parseResponse(response);

      if (!response.ok) {
        setUserStatus(payload?.error ?? 'Failed to create user.');
        return;
      }

      setUserStatus('User created successfully.');
      setAdminUserForm(emptyUserDraft);
      await loadData();
    } finally {
      setIsCreatingUser(false);
    }
  }

  async function saveUser() {
    if (!editingUser) return;
    setUserStatus(null);
    setIsSavingUser(true);

    try {
      const response = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ...userDraft,
          assignedLabIds: userDraft.role === 'admin' ? userDraft.assignedLabIds : [],
        }),
      });
      const payload = await parseResponse(response);

      if (!response.ok) {
        setUserStatus(payload?.error ?? 'Failed to update user.');
        return;
      }

      setUserStatus('User updated successfully.');
      closeUserModal();
      await loadData();
    } finally {
      setIsSavingUser(false);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this user?')) return;

    setIsDeletingUser(true);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {method: 'DELETE'});
      const payload = await parseResponse(response);
      if (!response.ok) {
        setUserStatus(payload?.error ?? 'Failed to delete user.');
        return;
      }

      setUserStatus('User deleted successfully.');
      await loadData();
    } finally {
      setIsDeletingUser(false);
    }
  }

  async function submitRequest() {
    setRequestStatus(null);

    if (!requestDraft.labId || !requestDraft.requestDate || !requestDraft.startTime || !requestDraft.endTime || !requestDraft.reason) {
      setRequestStatus('Please complete all request fields.');
      return;
    }

    setIsSubmittingRequest(true);
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          labId: requestDraft.labId,
          requestDate: new Date(`${requestDraft.requestDate}T00:00:00`).toISOString(),
          startTime: new Date(`${requestDraft.requestDate}T${requestDraft.startTime}`).toISOString(),
          endTime: new Date(`${requestDraft.requestDate}T${requestDraft.endTime}`).toISOString(),
          reason: requestDraft.reason,
        }),
      });

      const payload = await parseResponse(response);
      if (!response.ok) {
        setRequestStatus(payload?.error ?? 'Failed to submit request.');
        return;
      }

      setRequestStatus('Request submitted successfully.');
      closeLabModal();
      await loadData();
    } finally {
      setIsSubmittingRequest(false);
    }
  }

  async function reviewRequest(requestId: string, status: 'approved' | 'rejected') {
    const response = await fetch(`/api/requests/${requestId}`, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({status, reviewNote: reviewDraft.reviewNote || null}),
    });
    const payload = await parseResponse(response);
    if (!response.ok) {
      setRequestStatus(payload?.error ?? 'Failed to update request.');
      return;
    }

    setRequestStatus(`Request ${status}.`);
    await loadData();
  }

  function openReviewModal(request: AccessRequest) {
    setReviewingRequest(request);
    setReviewDraft({
      requestId: request._id,
      status: '',
      reviewNote: '',
    });
    setRequestStatus(null);
  }

  function closeReviewModal() {
    setReviewingRequest(null);
    setReviewDraft(emptyReviewDraft);
  }

  async function submitReview() {
    if (!reviewingRequest || !reviewDraft.status) return;

    setIsSubmittingReview(true);
    try {
      await reviewRequest(reviewingRequest._id, reviewDraft.status as 'approved' | 'rejected');
      closeReviewModal();
    } finally {
      setIsSubmittingReview(false);
    }
  }

  async function handleImport() {
    setImportStatus(null);
    setIsImportingLabs(true);

    try {
      const response = await fetch('/api/labs/import', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({rows: parsedRows}),
      });
      const payload = await parseResponse(response);
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Import failed');
      }

      setImportStatus(`Imported ${payload.imported ?? parsedRows.length} labs successfully.`);
      await loadData();
    } catch (error) {
      setImportStatus(error instanceof Error ? error.message : 'Import failed');
    } finally {
      setIsImportingLabs(false);
    }
  }

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, {type: 'array'});
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {defval: ''});
    setParsedRows(rows);
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">
      <HeaderSection
        user={user}
        activeTab={activeTab}
        visibleTabs={visibleTabs}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-12">
        {activeTab === 'overview' ? (
          <OverviewTab
            role={user?.role}
            user={user}
            labs={labs}
            assignedLabs={assignedLabs}
            totalUsers={users.length}
            pendingRequests={requests.filter((r) => r.status === 'pending')}
            approvedRequests={requests.filter((r) => r.status === 'approved')}
            allRequests={requests}
          />
        ) : null}

        {activeTab === 'labs' ? (
          <LabsTab
            isSuperAdmin={Boolean(isSuperAdmin)}
            isAdmin={Boolean(isAdmin)}
            labs={labs}
            assignedLabs={assignedLabs}
            selectedLabs={selectedLabs}
            setSelectedLabs={setSelectedLabs}
            toggleSelectAllLabs={toggleSelectAllLabs}
            deleteSelectedLabs={deleteSelectedLabs}
            openLabModal={openLabModal}
            deleteLab={deleteLab}
            labStatus={labStatus}
          />
        ) : null}

        {activeTab === 'users' && isSuperAdmin ? (
          <UsersTab
            users={users}
            labs={labs}
            adminUserForm={adminUserForm}
            setAdminUserForm={setAdminUserForm}
            setCreateUserRole={setCreateUserRole}
            toggleCreateUserLabSelection={toggleCreateUserLabSelection}
            createUser={createUser}
            openEditUser={openEditUser}
            deleteUser={deleteUser}
            userStatus={userStatus}
          />
        ) : null}

        {activeTab === 'requests' ? (
          <RequestsTab
            requests={requests}
            requestStatus={requestStatus}
            isSuperAdmin={Boolean(isSuperAdmin)}
            isAdmin={Boolean(isAdmin)}
            onReviewClick={openReviewModal}
          />
        ) : null}

        {activeTab === 'import' && isSuperAdmin ? (
          <ImportTab
            onFileChange={onFileChange}
            fileName={fileName}
            parsedRows={parsedRows}
            handleImport={handleImport}
            importStatus={importStatus}
          />
        ) : null}
      </div>

      <LabModal
        labModal={labModal}
        closeLabModal={closeLabModal}
        isSuperAdmin={Boolean(isSuperAdmin)}
        labDraft={labDraft}
        setLabDraft={setLabDraft}
        adminUsers={adminUsers}
        toggleLabAdminSelection={toggleLabAdminSelection}
        saveLab={saveLab}
        requestDraft={requestDraft}
        setRequestDraft={setRequestDraft}
        submitRequest={submitRequest}
        requestStatus={requestStatus}
      />

      <UserModal
        editingUser={editingUser}
        closeUserModal={closeUserModal}
        userDraft={userDraft}
        setUserDraft={setUserDraft}
        setEditUserRole={setEditUserRole}
        labs={labs}
        toggleEditUserLabSelection={toggleEditUserLabSelection}
        saveUser={saveUser}
      />

      <ReviewModal
        request={reviewingRequest}
        reviewDraft={reviewDraft}
        setReviewDraft={setReviewDraft}
        onClose={closeReviewModal}
        onSubmit={submitReview}
        isSubmitting={isSubmittingReview}
      />
    </main>
  );
}
