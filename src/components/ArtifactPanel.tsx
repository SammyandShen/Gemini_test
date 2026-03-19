import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Maximize2, Minimize2, Edit3, Eye, Download, Copy, Check, History, RotateCcw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtifactVersion } from '../hooks/useDeepResearch';
import { cn } from '../utils';

interface ArtifactPanelProps {
  content: string;
  versions: ArtifactVersion[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onContentChange: (content: string) => void;
  onSaveVersion: (content: string) => void;
  onRestoreVersion: (versionId: string) => void;
}

export function ArtifactPanel({ content, versions, isExpanded, onToggleExpand, onContentChange, onSaveVersion, onRestoreVersion }: ArtifactPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const originalContentRef = useRef(content);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-report.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Turning off edit mode, save version if changed
      if (content !== originalContentRef.current) {
        onSaveVersion(content);
      }
    } else {
      // Turning on edit mode, store original content
      originalContentRef.current = content;
    }
    setIsEditing(!isEditing);
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    }).format(new Date(timestamp));
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-900/80 backdrop-blur-xl border-l border-white/5 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-zinc-900/50 z-10">
        <div className="flex items-center gap-2 px-2">
          <div className="flex space-x-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
          </div>
          <span className="ml-2 text-xs font-mono text-zinc-400">research-report.md</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              showHistory ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
            )}
            title="Version History"
          >
            <History size={16} />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1"></div>
          <button
            onClick={toggleEdit}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-md transition-colors"
            title={isEditing ? "View" : "Edit"}
          >
            {isEditing ? <Eye size={16} /> : <Edit3 size={16} />}
          </button>
          <button
            onClick={handleCopy}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-md transition-colors"
            title="Copy"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-md transition-colors"
            title="Download"
          >
            <Download size={16} />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1"></div>
          <button
            onClick={onToggleExpand}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-md transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              className="w-full h-full min-h-[500px] bg-transparent text-zinc-300 font-mono text-sm resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-invert prose-zinc max-w-3xl mx-auto prose-headings:font-medium prose-headings:tracking-tight prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-white/10"
            >
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                }}
              >
                {content || '*Generating report...*'}
              </ReactMarkdown>
            </motion.div>
          )}
        </div>

        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-white/5 bg-zinc-900/95 backdrop-blur-md flex flex-col absolute right-0 top-0 bottom-0 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-medium text-sm text-zinc-200">Version History</h3>
                <button onClick={() => setShowHistory(false)} className="text-zinc-400 hover:text-zinc-100">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {versions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-zinc-500">
                    No versions saved yet.
                  </div>
                ) : (
                  [...versions].reverse().map((v) => (
                    <div key={v.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group border border-transparent hover:border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-zinc-300">
                          {v.source === 'ai' ? 'AI Generation' : 'Manual Edit'}
                        </span>
                        <span className="text-[10px] text-zinc-500">{formatDate(v.timestamp)}</span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                        {v.content.substring(0, 60)}...
                      </p>
                      <button
                        onClick={() => {
                          onRestoreVersion(v.id);
                          setShowHistory(false);
                        }}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <RotateCcw size={12} />
                        Restore this version
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
