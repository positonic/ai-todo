import { Modal, TextInput, Button, Group, Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from "react";
import { api } from "~/trpc/react";

type ProjectStatus = "ACTIVE" | "COMPLETED" | "ON_HOLD";
type ProjectPriority = "NONE" | "LOW" | "MEDIUM" | "HIGH";

export function CreateProjectModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("ACTIVE");
  const [priority, setPriority] = useState<ProjectPriority>("NONE");
  const [progress, setProgress] = useState(0);
  const [reviewDate, setReviewDate] = useState("");
  const [nextActionDate, setNextActionDate] = useState("");

  const utils = api.useUtils();

  const createProject = api.project.create.useMutation({
    onSuccess: () => {
      setName("");
      setStatus("ACTIVE");
      setPriority("NONE");
      setProgress(0);
      setReviewDate("");
      setNextActionDate("");
      void utils.project.getAll.invalidate();
      close();
    },
  });

  return (
    <>
      <Button onClick={open}>Create Project</Button>

      <Modal 
        opened={opened} 
        onClose={close}
        size="lg"
        radius="md"
        padding="lg"
        styles={{
          header: { display: 'none' },
          body: { padding: 0 },
          content: {
            backgroundColor: '#1A1B1E',
            color: '#C1C2C5',
          }
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createProject.mutate({
              name,
              status,
              priority,
              progress,
              reviewDate: reviewDate ? new Date(reviewDate) : null,
              nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
            });
          }}
          className="p-4"
        >
          <TextInput
            placeholder="Project name"
            variant="unstyled"
            size="xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            styles={{
              input: {
                fontSize: '24px',
                color: '#C1C2C5',
                '&::placeholder': {
                  color: '#C1C2C5',
                },
              },
            }}
          />
          
          <Select
            data={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'ON_HOLD', label: 'On Hold' },
            ]}
            value={status}
            onChange={(value) => setStatus(value as ProjectStatus)}
            required
            mt="md"
          />

          <Select
            data={[
              { value: 'NONE', label: 'None' },
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' },
            ]}
            value={priority}
            onChange={(value) => setPriority(value as ProjectPriority)}
            required
            mt="md"
          />

          <TextInput
            type="date"
            label="Review Date"
            value={reviewDate}
            onChange={(e) => setReviewDate(e.target.value)}
            mt="md"
          />

          <TextInput
            type="date"
            label="Next Action Date"
            value={nextActionDate}
            onChange={(e) => setNextActionDate(e.target.value)}
            mt="md"
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" color="gray" onClick={close}>
              Cancel
            </Button>
            <Button 
              type="submit"
              loading={createProject.isPending}
            >
              Create Project
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
} 