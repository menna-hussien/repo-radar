export interface Repository {
  id: number;
  fullName: string;
  description: string | null;
  avatarUrl: string;
  htmlUrl: string;

  stars: number | null;
  openIssues: number | null;
  lastCommitDate: string | null;
  lastUpdated: string | null;
}
