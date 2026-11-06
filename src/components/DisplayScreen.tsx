import type { DriveThruApp } from '../hooks'
import { ContextBar } from './ContextBar'
import { FeaturedGrid } from './FeaturedGrid'
import { MenuList } from './MenuList'

interface DisplayScreenProps {
  app: DriveThruApp
}

export function DisplayScreen({ app }: DisplayScreenProps) {
  return (
    <main className="display" data-band={app.band}>
      <ContextBar
        temperature={app.context.temperature}
        queue={app.context.queue}
        time={app.displayTime}
        mode={app.mode}
        tempSource={app.usingRealTemp ? 'real' : 'simulada'}
      />
      <FeaturedGrid products={app.featured} contextKey={app.contextKey} premium={app.premium} />
      <MenuList columns={app.menuColumns} featuredIds={app.featuredIds} />
    </main>
  )
}
