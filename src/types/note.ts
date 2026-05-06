export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  summary?: string;
  isPinned?: boolean;
  createdAt: number;
  updatedAt: number;
}
