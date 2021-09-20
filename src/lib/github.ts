import { graphql } from "@octokit/graphql";

const TOKEN = process.env["GITHUB_TOKEN"];
const client = graphql.defaults({
  headers: {
    authorization: `token ${TOKEN}`,
  },
});

export interface Repository {
  name: string;
  nameWithOwner: string;
  createdAt: string;
  pushedAt: string;
  diskUsage: number;
  forkCount: number;
  isArchived: boolean;
  isFork: boolean;
  isPrivate: boolean;
  languages: { nodes: { name: String }[] };
}

export async function* iterRepositories(): AsyncGenerator<Repository> {
  const QUERY = `query($endCursor: String) {
        viewer {
            repositories(first: 10, after: $endCursor) {
                nodes {
                    name
                    nameWithOwner
                    createdAt
                    diskUsage
                    forkCount
                    isArchived
                    isFork
                    isPrivate
                    pushedAt
                    languages(first: 10) {
                        nodes {
                            name
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
    }`;
  let param = {};
  while (true) {
    const { viewer: { repositories: { nodes, pageInfo } } } = await client(
      QUERY,
      param,
    );
    yield* nodes;
    if (pageInfo.hasNextPage) {
      param = {
        endCursor: pageInfo.endCursor,
      };
    } else {
      break;
    }
  }
}
