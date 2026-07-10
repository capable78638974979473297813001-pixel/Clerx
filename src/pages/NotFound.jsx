import { useNavigate } from 'react-router-dom'
import { Logo, Button, Stamp, Card, Icon, StampMark } from '../components/ui'

export default function NotFound() {
  const nav = useNavigate()
  return (
    <div className="grain grid min-h-screen place-items-center px-5">
      <div className="pointer-events-none absolute inset-0 dotgrid opacity-50" />
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mb-6 flex justify-center"><Logo size="lg" /></div>
        <Card className="p-10 shadow-hard-lg">
          <div className="relative mx-auto w-fit">
            <StampMark dim={64} />
            <Stamp tone="stamp" rotate={-10} className="absolute -right-16 top-2 bg-paper !text-[0.62rem]">Not on file</Stamp>
          </div>
          <h1 className="mt-6 font-display text-6xl font-semibold">404</h1>
          <p className="mt-2 text-[15px] text-ink-soft">This record isn't in the archive. It may have been moved or never filed.</p>
          <div className="mt-7 flex justify-center gap-2.5">
            <Button variant="outline" onClick={() => nav(-1)}>Go back</Button>
            <Button onClick={() => nav('/')}>Home <Icon.arrow size={16} /></Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
