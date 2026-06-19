import { getAuditIssues, runFullAuditConsoleReport } from './fullAudit';

// Make sure global container exists
if (typeof window !== 'undefined') {
  if (!(window as any).__QuantumFixTrackerStatus) {
    (window as any).__QuantumFixTrackerStatus = {};
  }
}

export const setFeatureStatus = (featureId: string, status: 'pending' | 'in-progress' | 'fixed') => {
  if (typeof window !== 'undefined') {
    (window as any).__QuantumFixTrackerStatus[featureId] = status;
    
    // Broadcast message or dispatch event for real-time reactivity in react components
    const event = new CustomEvent('quantum-feature-status-changed', {
      detail: { featureId, status }
    });
    window.dispatchEvent(event);
  }
  
  console.log(`%c🔧 FIX TRACKER: Updating ${featureId} to -> [${status.toUpperCase()}]`, 'color: #8b5cf6; font-weight: bold;');
};

export const getFixProgressSummary = () => {
  const issues = getAuditIssues();
  const total = issues.length;
  const fixed = issues.filter(i => i.status === 'fixed').length;
  const inProgress = issues.filter(i => i.status === 'in-progress').length;
  const pending = issues.filter(i => i.status === 'pending').length;
  const successRate = total > 0 ? Math.round((fixed / total) * 100) : 100;

  return {
    total,
    fixed,
    inProgress,
    pending,
    successRate
  };
};

export const logFixProgressConsole = () => {
  const summary = getFixProgressSummary();
  console.log('%c═══════════════════════════════════════════════════════════════', 'color: #22c55e; font-weight: bold;');
  console.log('%c🔧 Quantum Studio - Active Fix Dashboard', 'color: #10b981; font-weight: bold; font-size: 14px;');
  console.log(`   Total Features tracked for system resolution: ${summary.total}`);
  console.log(`   Status: In Progress...`);
  console.log(`   ✅ Resolved Operational: ${summary.fixed}`);
  console.log(`   ⚠️ In Development: ${summary.inProgress}`);
  console.log(`   ❌ Outstanding: ${summary.pending}`);
  console.log(`   📈 Success Rate: ${summary.successRate}%`);
  console.log('%c═══════════════════════════════════════════════════════════════', 'color: #22c55e; font-weight: bold;');
  
  return summary;
};

if (typeof window !== 'undefined') {
  (window as any).fixTracker = () => {
    logFixProgressConsole();
    return (window as any).__QuantumFixTrackerStatus;
  };
}
