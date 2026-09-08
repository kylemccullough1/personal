import { Button, Frame } from '@duckdgoose/win95-ui'

/**
 * The repository page: where the code is, how it is laid out, how to run it. Deliberately
 * plain: the link is the point, everything else is what a README's first screen would say.
 */
export function GitHubTab({ repo, site }: { repo: string; site: string }) {
  const open = (url: string) => window.open(url, '_blank', 'noopener,noreferrer')
  return (
    <Frame boxShadow="$in" bgColor="white" className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-3 text-[11px]">
      <div>
        <h2 className="m-0 text-[13px] font-bold">CharterTrip4 on GitHub</h2>
        <p className="m-0 mt-1">
          The whole app, its tests, the deploy workflow, an architecture document and a deploy
          runbook.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button className="h-[24px] px-4" onClick={() => open(repo)}>
          Open the repository
        </Button>
        <Button className="h-[24px] px-4" onClick={() => open(site)}>
          Open the live site
        </Button>
      </div>
      <Frame boxShadow="$in" bgColor="$material" className="p-2">
        <pre className="m-0 font-mono text-[10px] leading-[1.5]">{`src/CharterTrip.Core/            models + rules; references nothing
src/CharterTrip.Infrastructure/  the JSON store, backups, photos
src/CharterTrip.Web/             Blazor Server UI
tests/CharterTrip.Tests/         xUnit, 756 tests
tools/CharterTrip.SeedRefresh/   rebuilds the seed from a live trip.json
data/trip.seed.json              the starting dataset
docs/                            ARCHITECTURE.md, DEPLOY.md`}</pre>
      </Frame>
      <div>
        <p className="m-0 mb-1 font-bold">Run it</p>
        <Frame boxShadow="$in" bgColor="$material" className="p-2">
          <pre className="m-0 font-mono text-[10px] leading-[1.5]">{`git clone ${repo}.git
cd CharterTrip4
dotnet run --project src/CharterTrip.Web
dotnet test`}</pre>
        </Frame>
      </div>
      <p className="m-0 opacity-70">
        Built with C#, .NET 10, Blazor Server, a single JSON document as the store, GitHub Actions
        and Azure App Service.
      </p>
    </Frame>
  )
}
