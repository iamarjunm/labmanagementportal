"use client";

import {useState} from 'react';
import * as XLSX from 'xlsx';

type ParsedRow = {
  srNo?: string | number;
  labName?: string;
  labNumber?: string | number;
  location?: string;
  building?: string;
  departmentName?: string;
  description?: string;
};

const labDescription = `Manipal University Jaipur provides a wide range of dedicated physical facilities that support interdisciplinary research across academic disciplines. These include shared high-end laboratories, innovation hubs, and collaborative research centers equipped with advanced instruments and flexible workspaces. Such infrastructure promotes cross-departmental engagement, accelerates knowledge transfer, and enables faculty and students to work collectively on complex, real-world problems.`;

export default function LabImportPage() {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setStatus(null);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, {type: 'array'});
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const parsedRows = XLSX.utils.sheet_to_json<ParsedRow>(sheet, {defval: ''});
    setRows(parsedRows);
  }

  async function handleImport() {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/labs/import', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({rows, description: labDescription}),
      });

      const rawResponse = await response.text();
      const payload = rawResponse ? JSON.parse(rawResponse) : {};
      if (!response.ok) {
        throw new Error(payload?.error ?? 'Import failed');
      }

      setStatus(`Imported ${payload.imported ?? rows.length} labs successfully.`);
    } catch (importError) {
      setStatus(importError instanceof Error ? importError.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white lg:px-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-3xl font-semibold">Import labs from Excel</h1>
          <p className="mt-2 text-slate-300">
            Use the first sheet in your workbook. Expected columns: Lab Name, Lab Number, Location/Building name, Department Name. Sr No is optional and ignored.
          </p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
          <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:font-semibold file:text-slate-900" />
          {fileName ? <p className="text-sm text-slate-300">Loaded file: {fileName}</p> : null}
          <p className="text-sm text-slate-400">Parsed rows: {rows.length}</p>
          <button
            type="button"
            onClick={handleImport}
            disabled={!rows.length || loading}
            className="rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Importing...' : 'Import labs into Sanity'}
          </button>
          {status ? <p className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-200">{status}</p> : null}
        </section>
      </div>
    </main>
  );
}