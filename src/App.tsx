/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChatPanel } from './components/ChatPanel';
import { ArtifactPanel } from './components/ArtifactPanel';
import { useDeepResearch } from './hooks/useDeepResearch';
import { motion, AnimatePresence } from 'framer-motion';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  const { messages, artifact, versions, isLoading, sendMessage, setArtifact, saveUserVersion, restoreVersion } = useDeepResearch();
  const [isArtifactExpanded, setIsArtifactExpanded] = useState(false);

  const hasArtifact = artifact.length > 0;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full bg-zinc-950 text-zinc-50 overflow-hidden font-sans selection:bg-indigo-500/30">
        {/* Chat Panel */}
        <motion.div 
          className="flex flex-col h-full border-r border-white/10 relative z-10 bg-zinc-950"
          animate={{
            width: hasArtifact ? (isArtifactExpanded ? '30%' : '50%') : '100%',
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <ChatPanel 
            messages={messages} 
            isLoading={isLoading} 
            onSendMessage={sendMessage} 
          />
        </motion.div>

        {/* Artifact Panel */}
        <AnimatePresence>
          {hasArtifact && (
            <motion.div 
              className="flex flex-col h-full bg-zinc-900/50 relative z-0"
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: isArtifactExpanded ? '70%' : '50%', 
                opacity: 1 
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <ArtifactPanel 
                content={artifact} 
                versions={versions}
                isExpanded={isArtifactExpanded}
                onToggleExpand={() => setIsArtifactExpanded(!isArtifactExpanded)}
                onContentChange={setArtifact}
                onSaveVersion={saveUserVersion}
                onRestoreVersion={restoreVersion}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </QueryClientProvider>
  );
}
