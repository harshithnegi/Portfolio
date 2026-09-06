import React, { useState } from 'react';
import { Key, ShieldAlert, CheckCircle2, Lock, Unlock, Play, RefreshCw, Terminal } from 'lucide-react';

export default function JwtAnalyzerLab() {
  const [header, setHeader] = useState<{ alg: string; typ: string }>({
    alg: 'HS256',
    typ: 'JWT',
  });

  const [payload, setPayload] = useState<{
    sub: string;
    username: string;
    role: string;
    exp: number;
    admin: boolean;
  }>({
    sub: '10842',
    username: 'negi_guest',
    role: 'guest_user',
    exp: 1788531200,
    admin: false,
  });

  const [secret, setSecret] = useState<string>('cyber2026');
  const [crackedSecret, setCrackedSecret] = useState<string | null>(null);
  const [isCracking, setIsCracking] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<{
    status: number;
    statusText: string;
    data: any;
    flag?: string;
  } | null>(null);

  // Encode Base64Url helper
  const base64UrlEncode = (obj: any) => {
    return btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  };

  const headerB64 = base64UrlEncode(header);
  const payloadB64 = base64UrlEncode(payload);
  const signatureB64 = header.alg === 'none' ? '' : 'k8X_mP9qZ0vL3rT6wY1aK7...fake_sig';
  const fullToken = `${headerB64}.${payloadB64}.${signatureB64}`;

  const triggerAlgNone = () => {
    setHeader({ alg: 'none', typ: 'JWT' });
    setPayload(prev => ({ ...prev, role: 'superadmin', admin: true }));
    setApiResponse(null);
  };

  const triggerRoleEscalation = () => {
    setPayload(prev => ({
      ...prev,
      role: prev.role === 'superadmin' ? 'guest_user' : 'superadmin',
      admin: !prev.admin,
    }));
    setApiResponse(null);
  };

  const triggerDictionaryCrack = () => {
    setIsCracking(true);
    setCrackedSecret(null);
    setTimeout(() => {
      setIsCracking(false);
      setCrackedSecret(secret);
    }, 800);
  };

  const handleTestToken = () => {
    if (header.alg === 'none' && payload.role === 'superadmin') {
      setApiResponse({
        status: 200,
        statusText: 'OK - PRIVILEGE ESCALATION CONFIRMED',
        flag: 'FLAG{JWT_ALG_NONE_BYPASS_SUPERADMIN_2026}',
        data: {
          access: 'GRANTED (Superadmin Privileges)',
          message: 'Backend accepted alg=none unsigned token! Access to financial database granted.',
          confidential_keys: [
            'API_PROD_MASTER_KEY=sk_live_99218274192837',
            'DB_CONN_STR=postgres://admin:vaultMaster2026@10.0.4.12:5432/core',
          ],
        },
      });
    } else if (payload.role === 'superadmin' && header.alg !== 'none' && crackedSecret) {
      setApiResponse({
        status: 200,
        statusText: 'OK - FORGED HMAC SIGNATURE VALIDATED',
        flag: 'FLAG{JWT_HMAC_SECRET_CRACKED_FORGERY}',
        data: {
          access: 'GRANTED (Valid Forged Signature with Cracked Secret)',
          message: `Token was properly re-signed using cracked secret "${crackedSecret}".`,
          records_unlocked: 42,
        },
      });
    } else if (payload.role === 'superadmin' && header.alg !== 'none' && !crackedSecret) {
      setApiResponse({
        status: 401,
        statusText: 'Unauthorized',
        data: {
          error: 'JsonWebTokenError: invalid signature',
          message: 'Payload was modified but signature was not recalculated with the secret.',
        },
      });
    } else {
      setApiResponse({
        status: 403,
        statusText: 'Forbidden',
        data: {
          error: 'AccessDenied',
          message: 'User has role "guest_user". Only "superadmin" may access /api/v1/admin/secrets.',
        },
      });
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              JWT Vulnerability Inspector & Forger
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                LIVE INTERACTIVE LAB
              </span>
            </h3>
            <p className="text-xs font-mono text-gray-400">Testing Target: /api/v1/admin/secrets</p>
          </div>
        </div>

        {/* Action Presets */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={triggerAlgNone}
            className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Unlock className="w-3.5 h-3.5" />
            Exploit: "alg: none"
          </button>
          <button
            onClick={triggerRoleEscalation}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            Tamper Role Claim
          </button>
          <button
            onClick={triggerDictionaryCrack}
            disabled={isCracking}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCracking ? 'animate-spin' : ''}`} />
            Dictionary Crack Secret
          </button>
        </div>
      </div>

      {/* Raw JWT Token Display */}
      <div className="my-6">
        <label className="text-xs font-mono text-gray-400 block mb-2">RAW ENCODED JWT STRING:</label>
        <div className="p-4 rounded-xl bg-black/90 border border-white/10 font-mono text-xs break-all leading-relaxed">
          <span className="text-red-400 font-bold">{headerB64}</span>
          <span className="text-white font-bold">.</span>
          <span className="text-purple-400 font-bold">{payloadB64}</span>
          <span className="text-white font-bold">.</span>
          <span className="text-cyan-400 font-bold">{signatureB64 || '(NO SIGNATURE - ALG: NONE)'}</span>
        </div>
      </div>

      {/* Decoded Token Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {/* Header */}
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20">
          <div className="flex items-center justify-between text-xs font-mono text-red-400 font-bold mb-2">
            <span>HEADER: ALGORITHM & TYPE</span>
            <span>{header.alg}</span>
          </div>
          <pre className="font-mono text-xs text-red-200 overflow-x-auto">
            {JSON.stringify(header, null, 2)}
          </pre>
        </div>

        {/* Payload */}
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/20 md:col-span-2">
          <div className="flex items-center justify-between text-xs font-mono text-purple-400 font-bold mb-2">
            <span>PAYLOAD: CLAIMS & USER DATA</span>
            <span className={payload.role === 'superadmin' ? 'text-emerald-400' : 'text-gray-400'}>
              ROLE: {payload.role.toUpperCase()}
            </span>
          </div>
          <pre className="font-mono text-xs text-purple-200 overflow-x-auto">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
      </div>

      {/* HMAC Cracking Status Box */}
      {crackedSecret && (
        <div className="mb-6 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-mono text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Unlock className="w-4 h-4 text-cyan-400" />
            <span>DICTIONARY CRACK SUCCESSFUL: Secret key recovered from wordlist!</span>
          </div>
          <div className="bg-black/60 px-3 py-1 rounded border border-cyan-500/30 font-bold text-white">
            SECRET: "{crackedSecret}"
          </div>
        </div>
      )}

      {/* Dispatch Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleTestToken}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all cursor-pointer"
        >
          <Play className="w-4 h-4" />
          Dispatch Token to /api/v1/admin/secrets
        </button>
        <button
          onClick={() => {
            setHeader({ alg: 'HS256', typ: 'JWT' });
            setPayload({ sub: '10842', username: 'negi_guest', role: 'guest_user', exp: 1788531200, admin: false });
            setCrackedSecret(null);
            setApiResponse(null);
          }}
          className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white font-mono text-sm transition-all cursor-pointer"
        >
          Reset Token
        </button>
      </div>

      {/* Response Display */}
      {apiResponse && (
        <div className="rounded-xl border border-white/10 bg-black/90 p-5 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs text-gray-400 mb-4">
            <span>API GATEWAY RESPONSE</span>
            <span className={`font-bold ${apiResponse.status === 200 ? 'text-emerald-400' : 'text-red-400'}`}>
              HTTP {apiResponse.status} {apiResponse.statusText}
            </span>
          </div>

          {apiResponse.flag && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-bold">UNAUTHORIZED ADMIN ACCESS ACQUIRED:</span>
              <span className="bg-black/60 px-2.5 py-1 rounded border border-emerald-500/30 font-bold">{apiResponse.flag}</span>
            </div>
          )}

          <pre className="text-xs text-gray-300 overflow-x-auto">
            {JSON.stringify(apiResponse.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
