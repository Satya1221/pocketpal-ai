import AsyncStorage from '@react-native-async-storage/async-storage';

export type WorkspaceProject = {
  id: string;
  name: string;
  instructions: string;
  files: WorkspaceFile[];
  createdAt: number;
  updatedAt: number;
};

export type WorkspaceFile = {
  id: string;
  name: string;
  type: string;
  content: string;
  updatedAt: number;
};

export type WorkspaceMemory = {
  id: string;
  scope: 'global' | 'project' | 'chat';
  projectId?: string;
  text: string;
  createdAt: number;
};

const PROJECTS_KEY = '@pocketpal/workspace/projects/v1';
const MEMORY_KEY = '@pocketpal/workspace/memory/v1';

const safeJson = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
};

export const workspaceService = {
  async getProjects(): Promise<WorkspaceProject[]> {
    return safeJson(await AsyncStorage.getItem(PROJECTS_KEY), []);
  },

  async saveProjects(projects: WorkspaceProject[]) {
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  async createProject(name = 'New project'): Promise<WorkspaceProject> {
    const now = Date.now();
    const project: WorkspaceProject = {
      id: `project-${now}`,
      name,
      instructions: '',
      files: [],
      createdAt: now,
      updatedAt: now,
    };
    const projects = await this.getProjects();
    await this.saveProjects([project, ...projects]);
    return project;
  },

  async updateProject(project: WorkspaceProject) {
    const projects = await this.getProjects();
    const next = projects.map(p => p.id === project.id ? {...project, updatedAt: Date.now()} : p);
    await this.saveProjects(next);
  },

  async deleteProject(id: string) {
    await this.saveProjects((await this.getProjects()).filter(p => p.id !== id));
  },

  async getMemories(): Promise<WorkspaceMemory[]> {
    return safeJson(await AsyncStorage.getItem(MEMORY_KEY), []);
  },

  async saveMemory(memory: WorkspaceMemory) {
    const memories = await this.getMemories();
    await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify([memory, ...memories]));
  },

  async deleteMemory(id: string) {
    const memories = await this.getMemories();
    await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(memories.filter(m => m.id !== id)));
  },
};

export const chunkText = (text: string, size = 1200, overlap = 180): string[] => {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    const end = Math.min(normalized.length, start + size);
    chunks.push(normalized.slice(start, end));
    if (end === normalized.length) break;
    start = Math.max(start + 1, end - overlap);
  }
  return chunks;
};

const terms = (query: string) =>
  query.toLowerCase().split(/[^a-z0-9_]+/).filter(t => t.length > 1);

export const retrieveRelevantChunks = (documents: {name: string; content: string}[], query: string, limit = 5) => {
  const queryTerms = terms(query);
  return documents
    .flatMap(document => chunkText(document.content).map((content, index) => ({...document, content, index})))
    .map(chunk => {
      const haystack = chunk.content.toLowerCase();
      const score = queryTerms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return {...chunk, score};
    })
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export const makeUnifiedDiff = (before: string, after: string): string => {
  const a = before.split('\n');
  const b = after.split('\n');
  const max = Math.max(a.length, b.length);
  const lines: string[] = ['--- original', '+++ proposed'];
  for (let i = 0; i < max; i++) {
    if (a[i] === b[i]) lines.push(`  ${a[i] ?? ''}`);
    else {
      if (a[i] !== undefined) lines.push(`- ${a[i]}`);
      if (b[i] !== undefined) lines.push(`+ ${b[i]}`);
    }
  }
  return lines.join('\n');
};
