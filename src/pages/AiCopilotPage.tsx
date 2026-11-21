// ============================================================================
// DevPilot — AI Copilot Dedicated SaaS Page
// ============================================================================
import React from 'react';
import AICopilotChat from '../components/ai/AICopilotChat';

export default function AiCopilotPage() {
  return (
    <div className="h-[calc(100vh-4rem)] -m-4 sm:-m-6 overflow-hidden">
      <AICopilotChat isFullScreen={true} />
    </div>
  );
}
