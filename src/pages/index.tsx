import Head from "next/head";
import { iterRepositories, Repository } from "../lib/github";
import "nes.css/css/nes.min.css";

function DepsRs({ repo }: { repo: Repository }): JSX.Element {
  if (!repo.languages.nodes.some(({ name }) => name === "Rust")) {
    return <>-</>;
  }

  return (
    <>
      <a
        href={`https://deps.rs/repo/github/${repo.nameWithOwner}`}
        target="_blank"
        rel="noreferrer"
      >
        <img
          alt="badge"
          src={`https://deps.rs/repo/github/${repo.nameWithOwner}/status.svg`}
        />
      </a>
    </>
  );
}

function GoReportCard({ repo }: { repo: Repository }): JSX.Element {
  if (!repo.languages.nodes.some((node) => node.name === "Go")) {
    return <>-</>;
  }

  return (
    <>
      <a
        href={`https://goreportcard.com/report/${repo.nameWithOwner}`}
        target="_blank"
        rel="noreferrer"
      >
        <img
          alt="badge"
          src={`https://goreportcard.com/badge/github.com/${repo.nameWithOwner}`}
        />
      </a>
    </>
  );
}

function fmt(text: string): string {
  const d = new Date(text);
  return new Intl.DateTimeFormat("en-US").format(d);
}

export default function Home({
  repositories,
  lastupdate,
}: {
  repositories: Repository[];
  lastupdate: string;
}) {
  return (
    <div>
      <Head>
        <title>My repositories summary.</title>
        <meta name="description" content="My repositories summary." />
        <link
          rel="icon"
          href="data:image/gif;base64,R0lGODlhAQABAGAAACH5BAEKAP8ALAAAAAABAAEAAAgEAP8FBAA7"
        />
      </Head>

      <main>
        <div className="nes-container is-dark is-centered">
          <p>My Repositories summary.</p>
        </div>
        <div className="nes-container is-dark with-title">
          <p className="title">Last update</p>
          <p>{lastupdate}</p>
        </div>
        <div
          className="nes-table-responsive"
          style={{ backgroundColor: "#212529" }}
        >
          <table className="nes-table is-bordered is-dark">
            <thead>
              <tr>
                <th>name</th>
                <th>created at</th>
                <th>pushed at</th>
                <th>deps.rs</th>
                <th>Go Report Card</th>
              </tr>
            </thead>
            <tbody>
              {repositories.map((repo) => (
                <tr key={repo.name}>
                  <td>
                    <a
                      href={`https://github.com/${repo.nameWithOwner}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {repo.name}
                    </a>
                  </td>
                  <td>{fmt(repo.createdAt)}</td>
                  <td>{fmt(repo.pushedAt)}</td>
                  <td>
                    <DepsRs repo={repo} />
                  </td>
                  <td>
                    <GoReportCard repo={repo} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const repositories: Repository[] = [];
  for await (const result of iterRepositories()) {
    if (!result.isArchived && !result.isFork && !result.isPrivate) {
      repositories.push(result);
    }
  }
  repositories.sort((l, r) => {
    if (l.pushedAt < r.pushedAt) {
      return 1;
    } else if (l.pushedAt > r.pushedAt) {
      return -1;
    } else {
      return 0;
    }
  });
  return {
    props: {
      repositories,
      lastupdate: new Date().toISOString(),
    },
  };
}
