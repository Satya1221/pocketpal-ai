import React from 'react';
import {Alert, ScrollView, TextInput, TouchableOpacity, View} from 'react-native';
import {observer} from 'mobx-react';
import {Text} from 'react-native-paper';
import {useTheme} from '../../hooks';
import {
  WorkspaceProject,
  WorkspaceMemory,
  workspaceService,
  retrieveRelevantChunks,
  makeUnifiedDiff,
} from '../../services/WorkspaceService';
import {styles} from './styles';

type Tab = 'projects' | 'files' | 'code' | 'memory';

const Button = ({label, onPress, primary = false}: {label: string; onPress: () => void; primary?: boolean}) => {
  const theme = useTheme();
  return <TouchableOpacity onPress={onPress} style={[styles.button, {backgroundColor: primary ? theme.colors.primary : theme.colors.surfaceVariant}]}>
    <Text style={{color: primary ? theme.colors.onPrimary : theme.colors.onSurfaceVariant, fontWeight: '600'}}>{label}</Text>
  </TouchableOpacity>;
};

export const WorkspaceScreen: React.FC = observer(() => {
  const theme = useTheme();
  const [tab, setTab] = React.useState<Tab>('projects');
  const [projects, setProjects] = React.useState<WorkspaceProject[]>([]);
  const [memories, setMemories] = React.useState<WorkspaceMemory[]>([]);
  const [selectedId, setSelectedId] = React.useState<string>();
  const [query, setQuery] = React.useState('');
  const [memoryText, setMemoryText] = React.useState('');
  const [fileName, setFileName] = React.useState('notes.md');
  const [fileContent, setFileContent] = React.useState('');
  const [codeBefore, setCodeBefore] = React.useState('const answer = 42;');
  const [codeAfter, setCodeAfter] = React.useState('const answer = 43;');
  const [instructions, setInstructions] = React.useState('');

  const selected = projects.find(p => p.id === selectedId);

  const reload = React.useCallback(async () => {
    const [p, m] = await Promise.all([workspaceService.getProjects(), workspaceService.getMemories()]);
    setProjects(p); setMemories(m);
    if (!selectedId && p[0]) { setSelectedId(p[0].id); setInstructions(p[0].instructions); }
  }, [selectedId]);

  React.useEffect(() => { reload(); }, [reload]);

  const createProject = async () => {
    const p = await workspaceService.createProject();
    setProjects(await workspaceService.getProjects());
    setSelectedId(p.id);
    setInstructions('');
  };

  const saveProjectInstructions = async () => {
    if (!selected) return;
    await workspaceService.updateProject({...selected, instructions});
    setProjects(await workspaceService.getProjects());
  };

  const addFile = async () => {
    if (!selected || !fileContent.trim()) return;
    const file = {id: `file-${Date.now()}`, name: fileName || 'untitled.txt', type: 'text', content: fileContent, updatedAt: Date.now()};
    await workspaceService.updateProject({...selected, files: [...selected.files, file]});
    setProjects(await workspaceService.getProjects());
    setFileContent('');
  };

  const searchFiles = selected ? retrieveRelevantChunks(selected.files, query) : [];
  const addMemory = async () => {
    if (!memoryText.trim()) return;
    await workspaceService.saveMemory({id: `memory-${Date.now()}`, scope: selected ? 'project' : 'global', projectId: selected?.id, text: memoryText.trim(), createdAt: Date.now()});
    setMemoryText(''); setMemories(await workspaceService.getMemories());
  };

  const tabs: [Tab, string][] = [['projects','Projects'],['files','Files & RAG'],['code','Code'],['memory','Memory']];

  return <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
    <View style={styles.hero}>
      <Text variant="headlineSmall" style={{color: theme.colors.onBackground, fontWeight: '700'}}>Workspace</Text>
      <Text style={{color: theme.colors.onSurfaceVariant, marginTop: 4}}>Projects, local files, coding tools and memory — built for offline-first use.</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
      {tabs.map(([id,label]) => <TouchableOpacity key={id} onPress={() => setTab(id)} style={[styles.tab, tab === id && {backgroundColor: theme.colors.primary}]}>
        <Text style={{color: tab === id ? theme.colors.onPrimary : theme.colors.onSurfaceVariant, fontWeight: '600'}}>{label}</Text>
      </TouchableOpacity>)}
    </ScrollView>
    <ScrollView contentContainerStyle={styles.content}>
      {tab === 'projects' && <>
        <View style={styles.row}><Text variant="titleMedium" style={styles.flex}>Your projects</Text><Button label="+ New" primary onPress={createProject}/></View>
        {projects.length === 0 && <Text style={styles.muted}>Create a project to keep conversations, instructions and files together.</Text>}
        {projects.map(p => <TouchableOpacity key={p.id} onPress={() => {setSelectedId(p.id); setInstructions(p.instructions)}} style={[styles.card, selectedId === p.id && {borderColor: theme.colors.primary}]}>
          <Text variant="titleMedium">{p.name}</Text><Text style={styles.muted}>{p.files.length} files · updated {new Date(p.updatedAt).toLocaleDateString()}</Text>
        </TouchableOpacity>)}
        {selected && <View style={styles.card}>
          <Text variant="titleMedium">Project instructions</Text>
          <TextInput multiline value={instructions} onChangeText={setInstructions} placeholder="Tell the local model what this project is, coding conventions, and what it should understand first." style={[styles.editor,{color:theme.colors.onSurface,backgroundColor:theme.colors.surfaceVariant}]}/>
          <Button label="Save instructions" onPress={saveProjectInstructions} primary/>
        </View>}
      </>}

      {tab === 'files' && <>
        <Text variant="titleMedium">Local knowledge base</Text>
        <Text style={styles.muted}>Files are stored locally. Search retrieves relevant chunks instead of dumping entire documents into the prompt.</Text>
        {!selected && <Text style={styles.muted}>Select or create a project first.</Text>}
        {selected && <View style={styles.card}>
          <TextInput value={fileName} onChangeText={setFileName} placeholder="filename.md" style={[styles.input,{color:theme.colors.onSurface}]}/>
          <TextInput multiline value={fileContent} onChangeText={setFileContent} placeholder="Paste document/code content here" style={[styles.editor,{color:theme.colors.onSurface,backgroundColor:theme.colors.surfaceVariant}]}/>
          <Button label="Add to project" onPress={addFile} primary/>
        </View>}
        {selected && selected.files.map(f => <View key={f.id} style={styles.card}><Text variant="titleSmall">{f.name}</Text><Text style={styles.muted}>{f.content.length} characters</Text></View>)}
        {selected && <View style={styles.card}>
          <Text variant="titleMedium">Retrieve context</Text>
          <TextInput value={query} onChangeText={setQuery} placeholder="Ask about your project files…" style={[styles.input,{color:theme.colors.onSurface}]}/>
          {searchFiles.map(r => <View key={r.id + r.index} style={styles.result}><Text variant="labelMedium">{r.name} · chunk {r.index + 1} · score {r.score}</Text><Text style={styles.muted}>{r.content.slice(0,500)}</Text></View>)}
        </View>}
      </>}

      {tab === 'code' && <>
        <Text variant="titleMedium">Coding workspace</Text>
        <Text style={styles.muted}>Review changes before applying them. This foundation supports multi-file expansion, search, build/test results and undo in later iterations.</Text>
        <Text style={styles.label}>Original</Text>
        <TextInput multiline value={codeBefore} onChangeText={setCodeBefore} style={[styles.editor,{color:theme.colors.onSurface,backgroundColor:theme.colors.surfaceVariant}]}/>
        <Text style={styles.label}>Proposed</Text>
        <TextInput multiline value={codeAfter} onChangeText={setCodeAfter} style={[styles.editor,{color:theme.colors.onSurface,backgroundColor:theme.colors.surfaceVariant}]}/>
        <View style={styles.row}><Button label="Generate diff" primary onPress={() => {}}/><Button label="Review" onPress={() => Alert.alert('Review ready', makeUnifiedDiff(codeBefore, codeAfter))}/></View>
        <View style={styles.card}><Text variant="titleMedium">Build / test gate</Text><Text style={styles.muted}>Changes are intended to be reviewed and tested before application. No blind file replacement is performed.</Text></View>
      </>}

      {tab === 'memory' && <>
        <Text variant="titleMedium">Local memory</Text>
        <Text style={styles.muted}>Memory is separated into global, project and chat scopes. Only information you explicitly save here is persisted.</Text>
        <TextInput multiline value={memoryText} onChangeText={setMemoryText} placeholder="Save a preference, project fact or instruction…" style={[styles.editor,{color:theme.colors.onSurface,backgroundColor:theme.colors.surfaceVariant}]}/>
        <Button label={selected ? 'Save to project memory' : 'Save global memory'} onPress={addMemory} primary/>
        {memories.map(m => <View key={m.id} style={styles.card}><View style={styles.row}><Text variant="labelMedium">{m.scope.toUpperCase()}</Text><Button label="Delete" onPress={async () => {await workspaceService.deleteMemory(m.id); setMemories(await workspaceService.getMemories());}}/></View><Text>{m.text}</Text></View>)}
      </>}
    </ScrollView>
  </View>;
});
