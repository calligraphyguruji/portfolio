export type ImplementationStatus =
  | 'Implemented'
  | 'Partially implemented'
  | 'Mocked / simulated'
  | 'External dependency'
  | 'Planned';

export interface ArchitectureComponentNode {
  id: string;
  name: string;
  layer: 'Client Layer' | 'API & Gateway Layer' | 'Intelligence & ML Layer' | 'State & Rules Engine' | 'Data & Storage Tier' | 'External Provider';
  technology: string;
  description: string;
  status: ImplementationStatus;
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  dataOwned: string;
  securityControls: string[];
  sourceReferences: {
    file: string;
    lines?: string;
    description: string;
  }[];
  implementationNotes: string;
}

export interface ArchitectureViewOption {
  id: string;
  label: string;
  sublabel: string;
  iconName: 'Server' | 'GitCommit' | 'Cpu' | 'Workflow' | 'Database' | 'Layers';
  svgKey: string;
}

export interface ArchitectureDecision {
  title: string;
  decision: string;
  implementation: string;
  reason: string;
  tradeoff: string;
  evidence: string;
  status: ImplementationStatus;
}

export interface ProjectLifecycleState {
  status: string;
  actor: string;
  preconditions: string;
  auditEvent: string;
  failureBehavior: string;
  allowedTargets: string[];
}

export interface ProjectArchitectureDataset {
  projectId: string;
  projectTitle: string;
  subtitle: string;
  views: ArchitectureViewOption[];
  components: Record<string, ArchitectureComponentNode>;
  decisions: ArchitectureDecision[];
  lifecycleStates?: Record<string, ProjectLifecycleState>;
  lifecycleTitle?: string;
  defaultNodeId: string;
}

export const ARCHITECTURE_TYPES_LOADED = true;
