'use client';

import {
  Paper,
  Title,
  Text,
  Stack,
  TextInput,
  Checkbox,
  Textarea,
  Group,
  Button,
  Accordion,
  List,
} from "@mantine/core";
import { IconBulb, IconWriting, IconStars, IconList, IconPlus } from "@tabler/icons-react";
import { useLocalStorage } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import '@mantine/tiptap/styles.css';
import { api } from "~/trpc/react";
interface DailyEntry {
  date: string;
  intention: string;
  gratitude: string;
  exercise: string;
  journalName: string;
  journalDate: string;
  journalContent: string;
  notToDo: string[];
  completedItems: string[];
}

type DailyEntries = Record<string, DailyEntry>;

const getTodayString = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0]!;
};

const createEmptyEntry = (date: string): DailyEntry => ({
  date,
  intention: '',
  gratitude: '',
  exercise: '',
  journalName: '',
  journalDate: date,
  journalContent: '',
  notToDo: [],
  completedItems: [],
});

export function StartupRoutineForm() {
  const todayString = getTodayString();
  
  // Local storage for daily entries
  const [dailyEntries, setDailyEntries] = useLocalStorage<DailyEntries>({
    key: 'startup-routine-entries',
    defaultValue: { [todayString]: createEmptyEntry(todayString) },
  });

  // Get today's entry or create a new one
  const todayEntry = dailyEntries[todayString] ?? createEmptyEntry(todayString);

  // Form state
  const [intention, setIntention] = useState(todayEntry.intention);
  const [gratitude, setGratitude] = useState(todayEntry.gratitude);
  const [exercise, setExercise] = useState(todayEntry.exercise);
  const [journalName, setJournalName] = useState(todayEntry.journalName);
  const [journalDate, setJournalDate] = useState(todayEntry.journalDate);
  const [journalContent, setJournalContent] = useState(todayEntry.journalContent);
  const [notToDo, setNotToDo] = useState(todayEntry.notToDo);
  const [completedItems, setCompletedItems] = useState<string[]>(todayEntry.completedItems);
  const [newNotToDo, setNewNotToDo] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: journalContent,
    onUpdate: ({ editor }) => {
      setJournalContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[300px] prose prose-invert max-w-none',
      },
    },
  });

  // Update editor content when journalContent changes
  useEffect(() => {
    if (editor && editor.getHTML() !== journalContent) {
      editor.commands.setContent(journalContent);
    }
  }, [journalContent, editor]);

  // Save entry
  const saveEntry = () => {
    const updatedEntry: DailyEntry = {
      date: todayString,
      intention,
      gratitude,
      exercise,
      journalName,
      journalDate,
      journalContent,
      notToDo,
      completedItems,
    };

    setDailyEntries((prev: DailyEntries) => ({
      ...prev,
      [todayString]: updatedEntry,
    }));

    notifications.show({
      title: 'Progress Saved',
      message: 'Your morning routine has been saved',
      color: 'green',
    });
  };

  // Toggle completion of an item
  const toggleCompletion = (item: string) => {
    setCompletedItems(prev => {
      const newItems = prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item];
      
      // Save immediately when toggling completion
      const updatedEntry: DailyEntry = {
        date: todayString,
        intention,
        gratitude,
        exercise,
        journalName,
        journalDate,
        journalContent,
        notToDo,
        completedItems: newItems,
      };

      setDailyEntries((prev: DailyEntries) => ({
        ...prev,
        [todayString]: updatedEntry,
      }));
      
      return newItems;
    });
  };

  // Add new not-to-do item
  const addNotToDo = () => {
    if (newNotToDo.trim()) {
      setNotToDo((prev: string[]) => [...prev, newNotToDo.trim()]);
      setNewNotToDo('');
    }
  };

  const createOutcome = api.outcome.createOutcome.useMutation();

  const handleSaveAsOutcome = () => {
    if (!intention.trim()) return;
    
    createOutcome.mutate({
      description: intention,
      dueDate: new Date(),
    }, {
      onSuccess: () => {
        notifications.show({
          title: 'Outcome Created',
          message: 'Your intention was saved as an outcome',
          color: 'green',
        });
      }
    });
  };

  return (
    <Stack gap="xl">
      {/* What would make today great */}
      <Paper shadow="sm" p="md" radius="md" className="bg-[#262626]">
        <Stack gap="md">
          <Group justify="space-between">
            <Group>
              <IconBulb className="text-yellow-500" size={24} />
              <Title order={2} className="text-2xl">
                What would make today great?
              </Title>
            </Group>
            <Button
              variant="light"
              color="blue"
              leftSection={<IconPlus size={16} />}
              onClick={handleSaveAsOutcome}
              disabled={!intention.trim()}
            >
              Save as Outcome
            </Button>
          </Group>
          <TextInput
            placeholder="Enter your intention for today..."
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            size="md"
            className="bg-[#1E1E1E]"
          />
        </Stack>
      </Paper>

      {/* Routine Section */}
      <Paper shadow="sm" p="md" radius="md" className="bg-[#262626]">
        <Stack gap="md">
          <Group>
            <IconList className="text-blue-500" size={24} />
            <Title order={2} className="text-2xl">
              Exercise
            </Title>
          </Group>
          <TextInput
            placeholder="What exercise will you do today?"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            size="md"
            className="bg-[#1E1E1E]"
            rightSectionWidth={42}
            rightSection="🏃‍♂️"
          />
        </Stack>
      </Paper>

      {/* Gratitude Section */}
      <Paper shadow="sm" p="md" radius="md" className="bg-[#262626]">
        <Stack gap="md">
          <Group>
            <IconStars className="text-purple-500" size={24} />
            <Title order={2} className="text-2xl">
              Gratitude
            </Title>
          </Group>
          <Textarea
            placeholder="I'm grateful for..."
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            minRows={3}
            size="md"
            className="bg-[#1E1E1E]"
          />
          
        </Stack>
      </Paper>

      {/* Journal Section */}
      <Paper shadow="sm" p="md" radius="md" className="bg-[#262626]">
        <Stack gap="md">
          <Group>
            <IconWriting className="text-green-500" size={24} />
            <Title order={2} className="text-2xl">
              Journal
            </Title>
          </Group>
          <Text c="dimmed">
            Paper is more patient than people. Put your thoughts to the test.
          </Text>
          <RichTextEditor 
            editor={editor}
            styles={{
              root: {
                border: '1px solid #373A40',
                backgroundColor: '#1E1E1E',
              },
              toolbar: {
                backgroundColor: '#262626',
                border: 'none',
                borderBottom: '1px solid #373A40',
              },
              content: {
                backgroundColor: '#1E1E1E',
                color: '#C1C2C5',
                '& .ProseMirror': {
                  padding: '16px',
                  minHeight: '300px',
                },
              },
            }}
          >
            <RichTextEditor.Toolbar sticky stickyOffset={60}>
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.Strikethrough />
                <RichTextEditor.ClearFormatting />
                <RichTextEditor.Highlight />
                <RichTextEditor.Code />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.H4 />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Blockquote />
                <RichTextEditor.Hr />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
                <RichTextEditor.Subscript />
                <RichTextEditor.Superscript />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.AlignLeft />
                <RichTextEditor.AlignCenter />
                <RichTextEditor.AlignJustify />
                <RichTextEditor.AlignRight />
              </RichTextEditor.ControlsGroup>

              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Undo />
                <RichTextEditor.Redo />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>

            <RichTextEditor.Content />
          </RichTextEditor>
        </Stack>
      </Paper>

      {/* Consider Section - Axioms */}
      <Paper shadow="sm" p="md" radius="md" className="bg-[#262626]">
        <Stack gap="md">
          <Title order={2} className="text-2xl">Consider</Title>
          <Text size="lg" fw={500} className="text-purple-400">
            Axioms
          </Text>
          <List spacing="sm">
            {[
              'Confidence is comfort with failure',
              'Selfish behaviour stems from lack of self respect',
              'Who you blame is who you give your power to',
              'Nothing meaningful in life is easy, nothing easy in life is meaningful',
              'People respect you only as much as you respect yourself'
            ].map((axiom: string, index: number) => (
              <List.Item key={index}>
                <Checkbox
                  label={axiom}
                  checked={completedItems.includes(`axiom-${index}`)}
                  onChange={() => toggleCompletion(`axiom-${index}`)}
                  className="my-1"
                />
              </List.Item>
            ))}
          </List>
        </Stack>
      </Paper>

      {/* Important Questions */}
      <Paper shadow="sm" p="md" radius="md" className="bg-[#262626]">
        <Stack gap="md">
          <Title order={2} className="text-2xl">Important questions</Title>
          <Text c="dimmed">You want to consider daily</Text>
          <List spacing="sm">
            {[
              'How do I feel today?',
              'What are you currently procrastinating on?',
              'How can I respect myself today?',
              'What negative emotions do I often feel?',
              'What positive emotions do I often feel?'
            ].map((question: string, index: number) => (
              <List.Item key={index}>
                <Checkbox
                  label={question}
                  checked={completedItems.includes(`question-${index}`)}
                  onChange={() => toggleCompletion(`question-${index}`)}
                  className="my-1"
                />
              </List.Item>
            ))}
          </List>
        </Stack>
      </Paper>

      {/* Not-to-Do List */}
      <Paper shadow="sm" p="md" radius="md" className="bg-[#262626]">
        <Stack gap="md">
          <Title order={2} className="text-2xl">Not-to-Do List</Title>
          <Text c="dimmed">Things to avoid for a better day</Text>
          <Group>
            <TextInput
              placeholder="Add something to avoid..."
              value={newNotToDo}
              onChange={(e) => setNewNotToDo(e.target.value)}
              size="md"
              className="flex-grow bg-[#1E1E1E]"
            />
            <Button onClick={addNotToDo}>Add</Button>
          </Group>
          <List spacing="sm">
            {notToDo.map((item: string, index: number) => (
              <List.Item key={index}>
                <Checkbox
                  label={item}
                  checked={completedItems.includes(`not-to-do-${index}`)}
                  onChange={() => toggleCompletion(`not-to-do-${index}`)}
                  className="my-1"
                />
              </List.Item>
            ))}
          </List>
        </Stack>
      </Paper>

      {/* Mindset Section */}
      <Paper shadow="sm" p="md" radius="md" className="bg-[#262626]">
        <Stack gap="md">
          <Title order={2} className="text-2xl">Mindset</Title>
          <Text c="dimmed">At least 2 minutes</Text>
          <Button 
            variant="light" 
            color="blue" 
            size="lg"
            className="w-full"
            onClick={() => toggleCompletion('mindset-sculpting')}
            data-completed={completedItems.includes('mindset-sculpting')}
          >
            Mindset and identity sculpting
          </Button>
          <Button 
            variant="light" 
            color="grape" 
            size="lg"
            className="w-full"
            onClick={() => toggleCompletion('visualization')}
            data-completed={completedItems.includes('visualization')}
          >
            Do your visualization at this point
          </Button>
        </Stack>
      </Paper>

      <Group justify="space-between" className="sticky bottom-0 bg-[#1E1E1E] p-4 rounded-t-lg shadow-lg">
        <Text size="sm" c="dimmed">
          Last saved: {new Date().toLocaleTimeString()}
        </Text>
        <Button onClick={saveEntry} size="lg">
          Save Progress
        </Button>
      </Group>
    </Stack>
  );
} 