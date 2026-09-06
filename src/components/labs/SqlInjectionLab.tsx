import React, { useState } from 'react';
import { Database, Play, RotateCcw, ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

export default function SqlInjectionLab() {
  const [username, setUsername] = useState<string>("' OR '1'='1' --");
  const [password, setPassword] = useState<string>('random_pass');
  const [usePreparedStatement, setUsePreparedStatement] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<{
    status: 'idle' | 'success' | 'blocked' | 'error';
    message: string;
    flag?: string;
    records?: Array<{ id: number; username: string; role: string; password_hash: string }>;
  }>({
    status: 'idle',
    message: 'Enter payload or select a preset to execute query.',
  });

  const presets = [
    { label: "' OR '1'='1' -- (Auth Bypass)", user: "' OR '1'='1' --", pass: 'password123' },
    { label: "admin' -- (Admin Impersonation)", user: "admin' --", pass: 'anything' },
    { label: "UNION SELECT (Data Exfiltration)", user: "' UNION SELECT 99, 'harshit_admin', 'superadmin', '$2b$12$K89eP...flag' --", pass: 'pwned' },
  ];

  const handleExecute = () => {
    if (usePreparedStatement) {
      // Prepared statement safely treats input as literal
      setExecutionResult({
        status: 'blocked',
        message: 'Query Blocked: Database evaluated input as a literal string. Zero records matched username.',
      });
      return;
    }

    // Vulnerable execution
    if (username.includes("' OR '1'='1") || username.includes("' or '1'='1") || username.includes("' OR 1=1")) {
      setExecutionResult({
        status: 'success',
        message: 'AUTHENTICATION BYPASS SUCCESSFUL: WHERE clause evaluated to TRUE for all rows. Logged in as Administrator.',
        flag: 'FLAG{SQLI_AUTH_BYPASS_EXPLOITED_2026}',
        records: [
          { id: 1, username: 'admin', role: 'System Administrator', password_hash: '$2y$10$wK8rX.qE6...hash' },
          { id: 2, username: 'ceo_executive', role: 'Executive', password_hash: '$2y$10$b9mP2.vL8...hash' },
          { id: 3, username: 'harshit_dev', role: 'Security Engineer', password_hash: '$2y$10$z7tY1.aK3...hash' },
        ],
      });
    } else if (username.includes("admin'")) {
      setExecutionResult({
        status: 'success',
        message: "ADMIN IMPERSONATION SUCCESSFUL: Query truncated comment '--' ignored password verification.",
        flag: 'FLAG{SQLI_COMMENT_TRUNCATION_PWNED}',
        records: [
          { id: 1, username: 'admin', role: 'System Administrator', password_hash: '$2y$10$wK8rX.qE6...hash' },
        ],
      });
    } else if (username.toUpperCase().includes('UNION SELECT')) {
      setExecutionResult({
        status: 'success',
        message: 'UNION-BASED DATABASE EXTRACTION: Injected query appended external rows from secret credentials table.',
        flag: 'FLAG{SQLI_UNION_DB_EXFILTRATED}',
        records: [
          { id: 99, username: 'harshit_admin', role: 'superadmin', password_hash: '$2b$12$K89eP.FLAG_SECRET_KEY' },
          { id: 100, username: 'db_root', role: 'postgres_superuser', password_hash: '$2b$12$m19oX.MASTER_VAULT' },
        ],
      });
    } else {
      setExecutionResult({
        status: 'error',
        message: 'Query executed normally: Invalid credentials. No injection detected.',
      });
    }
  };

  const rawQuery = usePreparedStatement
    ? `PREPARE login_stmt (text) AS SELECT * FROM users WHERE username = $1;\nEXECUTE login_stmt('${username.replace(/'/g, "''")}');`
    : `SELECT * FROM users WHERE username = '${username}' AND password = '${password}';`;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header & Target Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              SQL Injection & Auth Bypass Simulator
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                LIVE INTERACTIVE LAB
              </span>
            </h3>
            <p className="text-xs font-mono text-gray-400">Target Endpoint: https://auth.vault-target.local/api/v1/auth/login</p>
          </div>
        </div>

        {/* Defense Toggle */}
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <span className="text-xs font-mono text-gray-300">Defense Mode:</span>
          <button
            onClick={() => {
              setUsePreparedStatement(!usePreparedStatement);
              setExecutionResult({ status: 'idle', message: 'Toggled defense mode. Run query to test.' });
            }}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              usePreparedStatement
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}
          >
            {usePreparedStatement ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                Prepared Statements (ON)
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                Vulnerable String Concat (OFF)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Payloads */}
      <div className="my-6">
        <label className="text-xs font-mono text-gray-400 block mb-2">QUICK INJECTION PAYLOAD PRESETS:</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUsername(preset.user);
                setPassword(preset.pass);
              }}
              className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => {
              setUsername('legit_user');
              setPassword('normalpassword');
            }}
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            Standard User Input
          </button>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs font-mono text-gray-400 block mb-1.5">INPUT USERNAME / PAYLOAD:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-black/80 border border-white/20 rounded-xl px-4 py-2.5 font-mono text-sm text-blue-300 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="' OR '1'='1' --"
          />
        </div>
        <div>
          <label className="text-xs font-mono text-gray-400 block mb-1.5">INPUT PASSWORD:</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/80 border border-white/20 rounded-xl px-4 py-2.5 font-mono text-sm text-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="password"
          />
        </div>
      </div>

      {/* Live Generated SQL Query Preview */}
      <div className="mb-6 rounded-xl border border-white/10 bg-black/80 p-4">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-2">
          <span>BACKEND SQL EXECUTION ENGINE:</span>
          <span className={usePreparedStatement ? 'text-emerald-400' : 'text-amber-400'}>
            {usePreparedStatement ? '● PARAMETERIZED' : '● UNPROTECTED RAW QUERY'}
          </span>
        </div>
        <pre className="font-mono text-xs md:text-sm text-gray-200 overflow-x-auto whitespace-pre-wrap">
          <code>{rawQuery}</code>
        </pre>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleExecute}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all cursor-pointer"
        >
          <Play className="w-4 h-4" />
          Send Exploit Query
        </button>
        <button
          onClick={() => {
            setUsername("' OR '1'='1' --");
            setPassword('password123');
            setUsePreparedStatement(false);
            setExecutionResult({ status: 'idle', message: 'Reset to default state.' });
          }}
          className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white font-mono text-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Execution Results Console */}
      <div className="rounded-xl border border-white/10 bg-black/90 p-5 font-mono">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-gray-400 mb-4">
          <span>SERVER EXECUTION LOG</span>
          <span className="uppercase">{executionResult.status}</span>
        </div>

        {/* Flag Banner if Pwned */}
        {executionResult.flag && (
          <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold">VULNERABILITY CONFIRMED & REPRODUCED!</span>
            </div>
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
              <Key className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wider">{executionResult.flag}</span>
            </div>
          </div>
        )}

        <p className={`text-sm mb-4 ${
          executionResult.status === 'success'
            ? 'text-emerald-300'
            : executionResult.status === 'blocked'
            ? 'text-blue-300'
            : executionResult.status === 'error'
            ? 'text-red-400'
            : 'text-gray-400'
        }`}>
          {executionResult.message}
        </p>

        {/* Extracted Database Records */}
        {executionResult.records && executionResult.records.length > 0 && (
          <div className="mt-4">
            <div className="text-xs text-gray-400 mb-2">EXFILTRATED DATABASE ROWS:</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-white/10">
                <thead className="bg-white/5 text-gray-300">
                  <tr>
                    <th className="p-2.5 border-b border-white/10">UID</th>
                    <th className="p-2.5 border-b border-white/10">USERNAME</th>
                    <th className="p-2.5 border-b border-white/10">ROLE</th>
                    <th className="p-2.5 border-b border-white/10">PASSWORD HASH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  {executionResult.records.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-2.5 font-bold text-blue-400">{r.id}</td>
                      <td className="p-2.5 text-white font-bold">{r.username}</td>
                      <td className="p-2.5 text-emerald-400">{r.role}</td>
                      <td className="p-2.5 font-mono text-gray-400">{r.password_hash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
