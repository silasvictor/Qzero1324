/**
 * QueueZero Mathematical Dispatch & Dynamic Penalized Priority Formulation
 * P_i = (w_i / EPT_i) + alpha * (T_wait)
 */

export interface QueueJob {
  orderId: string;
  trackingCode: string;
  printMode: 'INSTANT' | 'SCHEDULED';
  estimatedPrintTimeSec: number;
  createdAt: Date;
  isPhysicalCheckIn?: boolean;
}

export function calculatePriorityRank(job: QueueJob): number {
  // Base weight
  let w_i = 1.0;
  if (job.printMode === 'INSTANT') {
    w_i = 3.0;
  }
  if (job.isPhysicalCheckIn) {
    w_i = 10.0; // Dynamic inflation upon kiosk QR scan
  }

  const EPT = Math.max(job.estimatedPrintTimeSec, 5); // Avoid division by zero
  const brevityScore = w_i / (EPT / 60); // Jobs with fewer pages rank higher (Shortest Job First)

  // Waiting time in minutes
  const now = Date.now();
  const waitMinutes = Math.max(0, (now - job.createdAt.getTime()) / (1000 * 60));
  const alpha = 0.8; // Escalation constant so long waiting jobs do not starve

  const priorityScore = brevityScore + (alpha * waitMinutes);
  return +priorityScore.toFixed(3);
}

/**
 * Sorts jobs descending by priority score (highest score prints next)
 */
export function sortQueueJobs(jobs: QueueJob[]): { job: QueueJob; priorityScore: number }[] {
  return jobs
    .map(j => ({ job: j, priorityScore: calculatePriorityRank(j) }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}
