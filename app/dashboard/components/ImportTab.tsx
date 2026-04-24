import type {ChangeEvent} from 'react';

type ImportTabProps = {
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  fileName: string;
  parsedRows: Array<Record<string, unknown>>;
  handleImport: () => Promise<void>;
  importStatus: string | null;
};

export function ImportTab({onFileChange, fileName, parsedRows, handleImport, importStatus}: ImportTabProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">Import labs from Excel</h2>
      <p className="max-w-4xl text-sm leading-7 text-slate-600">Expected columns: Lab Name, Lab Number, Location/Building name, Department Name. Sr No is optional and ignored.</p>

      <input type="file" accept=".xlsx,.xls" onChange={onFileChange} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:font-semibold file:text-white" />
      {fileName ? <p className="text-sm text-slate-500">Loaded file: {fileName}</p> : null}
      <p className="text-sm text-slate-500">Parsed rows: {parsedRows.length}</p>
      <button type="button" onClick={handleImport} disabled={!parsedRows.length} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Import labs</button>
      {importStatus ? <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{importStatus}</p> : null}
    </section>
  );
}
