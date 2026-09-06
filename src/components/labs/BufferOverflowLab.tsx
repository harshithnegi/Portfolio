import React, { useState } from 'react';
import { Cpu, Play, RotateCcw, ShieldAlert, CheckCircle2, Terminal, AlertTriangle, ArrowDown } from 'lucide-react';

export default function BufferOverflowLab() {
  const [bufferLength, setBufferLength] = useState<number>(32);
  const [customEip, setCustomEip] = useState<string>('0x41414141');
  const [hijacked, setHijacked] = useState<boolean>(false);

  const bufferSize = 64;
  const ebpOffset = 64;
  const eipOffset = 68; // 64 buffer + 4 saved ebp

  const isBufferOverflowed = bufferLength > bufferSize;
  const isEipOverwritten = bufferLength >= 72;

  const handleInjectExploit = () => {
    setBufferLength(72);
    setCustomEip('0x080484b6'); // Address of win_function()
    setHijacked(true);
  };

  const handleReset = () => {
    setBufferLength(32);
    setCustomEip('0x41414141');
    setHijacked(false);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Stack Buffer Overflow & Memory Visualizer
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30">
                LIVE INTERACTIVE LAB
              </span>
            </h3>
            <p className="text-xs font-mono text-gray-400">32-Bit x86 Memory Frame & EIP Register Hijacking</p>
          </div>
        </div>

        {/* Exploit Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleInjectExploit}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-green to-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,159,0.4)] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4" />
            Inject EIP Hijack Payload
          </button>
          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Payload Slider */}
      <div className="my-6 p-5 rounded-xl bg-black/80 border border-white/10 font-mono text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 font-bold">INPUT PAYLOAD SIZE: {bufferLength} BYTES</span>
          <span className={isEipOverwritten ? 'text-red-400 font-bold' : isBufferOverflowed ? 'text-amber-400' : 'text-emerald-400'}>
            {isEipOverwritten ? '● EIP OVERWRITTEN (CRASH / HIJACK)' : isBufferOverflowed ? '● BUFFER BOUNDARY BREACHED' : '● SAFE IN-BOUNDS MEMORY'}
          </span>
        </div>
        <input
          type="range"
          min="16"
          max="88"
          value={bufferLength}
          onChange={(e) => {
            setBufferLength(Number(e.target.value));
            setHijacked(false);
          }}
          className="w-full accent-neon-green cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>16 Bytes</span>
          <span>Buffer Limit (64B)</span>
          <span>Saved EBP (68B)</span>
          <span>Return EIP (72B)</span>
          <span>88 Bytes</span>
        </div>
      </div>

      {/* Interactive Visual Memory Stack Layout */}
      <div className="my-6 space-y-3 font-mono text-xs">
        <div className="text-gray-400 text-xs mb-2">32-BIT VIRTUAL MEMORY STACK FRAME:</div>

        {/* 1. Target Buffer */}
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-950/20">
          <div className="flex items-center justify-between text-blue-400 font-bold mb-1">
            <span>[0xbffff7a0] LOCAL BUFFER (char buffer[64])</span>
            <span>{Math.min(bufferLength, 64)} / 64 BYTES FILLED</span>
          </div>
          <div className="p-2 rounded bg-black/60 text-gray-300 break-all text-[11px]">
            {'A'.repeat(Math.min(bufferLength, 64)) || '(empty)'}
          </div>
        </div>

        {/* 2. Saved Frame Pointer (EBP) */}
        <div className={`p-4 rounded-xl border transition-all ${
          bufferLength > 64
            ? 'border-amber-500/40 bg-amber-950/20 text-amber-300'
            : 'border-white/10 bg-black/60 text-gray-400'
        }`}>
          <div className="flex items-center justify-between font-bold mb-1">
            <span>[0xbffff7e0] SAVED FRAME POINTER ($EBP) - 4 BYTES</span>
            <span>{bufferLength > 64 ? 'CORRUPTED WITH 0x41414141' : '0xbffff808 (Normal)'}</span>
          </div>
          <div className="p-2 rounded bg-black/60 text-[11px]">
            {bufferLength > 64 ? '0x41414141 (Overwritten with AAAA)' : '0xbffff808'}
          </div>
        </div>

        {/* 3. Instruction Pointer (EIP) */}
        <div className={`p-4 rounded-xl border transition-all ${
          hijacked
            ? 'border-neon-green bg-emerald-950/30 text-neon-green shadow-[0_0_25px_rgba(0,255,159,0.3)]'
            : isEipOverwritten
            ? 'border-red-500 bg-red-950/30 text-red-300 shadow-[0_0_25px_rgba(255,0,60,0.3)]'
            : 'border-white/10 bg-black/60 text-gray-400'
        }`}>
          <div className="flex items-center justify-between font-bold mb-1">
            <span>[0xbffff7e4] RETURN ADDRESS REGISTER ($EIP) - 4 BYTES</span>
            <span>{hijacked ? '0x080484b6 (HIJACKED -> win_function)' : isEipOverwritten ? '0x41414141 (SIGSEGV CRASH)' : '0x08048492 (__libc_start_main)'}</span>
          </div>
          <div className="p-2 rounded bg-black/60 text-[11px] font-bold">
            EIP Value: {hijacked ? '0x080484b6 (<win_function+0x00>)' : isEipOverwritten ? '0x41414141 (Segmentation Fault)' : '0x08048492'}
          </div>
        </div>
      </div>

      {/* Exploit Status Banner */}
      {hijacked && (
        <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/40 text-neon-green font-mono text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-5 h-5 text-neon-green" />
            <span>CONTROL FLOW HIJACKED: Instruction pointer redirected to target function!</span>
          </div>
          <div className="bg-black/60 px-3 py-1 rounded border border-neon-green/30 font-bold">
            FLAG&#123;STACK_BOF_EIP_CONTROL_PWNED_2026&#125;
          </div>
        </div>
      )}
    </div>
  );
}
