import { useRef, useState } from 'react';
import { FileLock2, ShieldCheck, UploadCloud, Download, Eye, EyeOff, LockKeyhole, CircleCheck, AlertCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [consent, setConsent] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [output, setOutput] = useState<Blob | null>(null);
  const [dragging, setDragging] = useState(false);

  function clear() {
    setFile(null);
    setPassword('');
    setOutput(null);
    setError('');
    setSuccess('');
    setConsent(false);
    if (input.current) input.current.value = '';
  }
  function select(selected?: File) {
    setError('');
    setSuccess('');
    setOutput(null);
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF document.');
      return;
    }
    setFile(selected);
    setPassword('');
  }
  async function unlock() {
    if (!file) { setError('Choose a PDF file first.'); return; }
    if (!consent) { setError('Please confirm that you are authorized to unlock this document.'); return; }
    setWorking(true);
    setError('');
    setSuccess('');
    setOutput(null);
    try {
      const mupdf = await import('mupdf');
      const data = new Uint8Array(await file.arrayBuffer());
      if (data.length < 5 || new TextDecoder().decode(data.subarray(0, 5)) !== '%PDF-') {
        throw new Error('The selected file is not a valid PDF.');
      }
      const doc = mupdf.Document.openDocument(data, 'application/pdf');
      try {
        if (doc.needsPassword() && !doc.authenticatePassword(password)) {
          throw new Error('Incorrect password. Please enter the correct PDF password.');
        }
        const pdf = doc.asPDF();
        if (!pdf) throw new Error('This file could not be opened as a PDF.');
        const buffer = pdf.saveToBuffer('encrypt=none,garbage=compact');
        try {
          const copy = Uint8Array.from(buffer.asUint8Array());
          setOutput(new Blob([copy], { type: 'application/pdf' }));
          setSuccess('PDF unlocked successfully. Your unprotected copy is ready to download.');
          setPassword('');
        } finally {
          buffer.destroy();
        }
      } finally {
        doc.destroy();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to unlock the selected PDF.');
    } finally {
      setWorking(false);
    }
  }
  function download() {
    if (!file || !output) return;
    const url = URL.createObjectURL(output);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name.replace(/\.pdf$/i, '') + '-unlocked.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
  return (
    <div className="page">
      <header className="topbar">
        <div className="identity"><div className="logo"><FileLock2 size={22}/></div><div>PDF<span>UNLOCK</span><small>SECURITY REMOVER</small></div></div>
        <span className="private"><ShieldCheck size={16}/> 100% local processing</span>
      </header>
      <main>
        <section className="hero">
          <div className="pill"><ShieldCheck size={15}/> PRIVATE · SECURE · SIMPLE</div>
          <h1>Unlock your PDF.<br/><span>Keep what matters.</span></h1>
          <p>Remove PDF password protection using the correct password. Preserve the document's original content and formatting.</p>
        </section>
        <section className="panel" aria-label="PDF unlocking tool">
          <div className="heading"><div><h2>Unlock a document</h2><p>Your file never leaves this browser.</p></div><LockKeyhole size={24}/></div>
          <input ref={input} type="file" accept=".pdf,application/pdf" onChange={e => select(e.target.files?.[0])} hidden aria-label="Choose PDF document"/>
          <div className={`upload ${dragging ? 'dragging' : ''}`} onDragEnter={e => {e.preventDefault();setDragging(true);}} onDragOver={e=>e.preventDefault()} onDragLeave={e=>{e.preventDefault();setDragging(false);}} onDrop={e=>{e.preventDefault();setDragging(false);select(e.dataTransfer.files[0]);}}>
            <div className="fileicon"><UploadCloud size={30}/></div>
            <strong>{file ? file.name : 'Drop your PDF here'}</strong>
            <p>{file ? (file.size / 1048576).toFixed(2) + ' MB · PDF document' : 'Or choose a file from your device'}</p>
            <button className="browse" type="button" disabled={working} onClick={()=>input.current?.click()}>{file?'Choose another PDF':'Browse files'}</button>
          </div>
          <label htmlFor="password" className="fieldlabel">Document password</label>
          <div className="pwd"><LockKeyhole size={18}/><input id="password" type={visible?'text':'password'} value={password} onChange={e=>{setPassword(e.target.value);setOutput(null);setSuccess('');}} placeholder="Enter PDF password (if required)" disabled={working} autoComplete="off"/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?'Hide password':'Show password'}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>
          <label className="approval"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} disabled={working}/><span>I own this PDF or have explicit authorization to remove its protection.</span></label>
          <button className="primary" onClick={unlock} disabled={working || !file}>{working?'Processing your PDF…':'Unlock PDF securely'} <LockKeyhole size={18}/></button>
          {error && <div className="alert error" role="alert"><AlertCircle size={19}/><span>{error}</span></div>}
          {success && <div className="alert success" role="status"><CircleCheck size={19}/><span>{success}</span></div>}
          {output && <button className="download" onClick={download}><Download size={20}/> Download unlocked PDF</button>}
          {file && <button className="reset" onClick={clear}><RotateCcw size={15}/> Start over</button>}
        </section>
        <section className="features">
          <article><ShieldCheck size={23}/><h3>Privacy first</h3><p>All processing happens locally in your browser. Files and passwords are not uploaded to us.</p></article>
          <article><FileLock2 size={23}/><h3>Original PDF format</h3><p>No page-to-image conversion. Text, embedded images and formatting are retained where supported.</p></article>
          <article><Download size={23}/><h3>Ready to download</h3><p>Save an unencrypted copy directly to your device when processing succeeds.</p></article>
        </section>
        <p className="fineprint">Works with supported standard password-encrypted PDFs. Certificate encryption, proprietary DRM, and damaged PDFs may not work. Saving can invalidate digital signatures. Use only on documents you are authorized to modify.</p>
      </main>
      <footer>PDF Security Remover <span>·</span> Private browser processing</footer>
    </div>
  );
}
