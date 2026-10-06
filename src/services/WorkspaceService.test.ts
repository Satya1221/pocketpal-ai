import {chunkText, makeUnifiedDiff, retrieveRelevantChunks} from './WorkspaceService';

describe('WorkspaceService', () => {
  it('chunks text with overlap', () => {
    const chunks = chunkText('abcdefghijklmnopqrstuvwxyz', 10, 2);
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks[0]).toContain('abcdefghij');
  });

  it('retrieves relevant local context without sending it anywhere', () => {
    const result = retrieveRelevantChunks(
      [{name: 'notes.md', content: 'React Native uses TypeScript.\nOffline RAG retrieves relevant context.'}],
      'offline TypeScript',
    );
    expect(result[0].name).toBe('notes.md');
    expect(result[0].score).toBeGreaterThan(0);
  });

  it('creates a reviewable diff', () => {
    const diff = makeUnifiedDiff('const a = 1;', 'const a = 2;');
    expect(diff).toContain('- const a = 1;');
    expect(diff).toContain('+ const a = 2;');
  });
});
