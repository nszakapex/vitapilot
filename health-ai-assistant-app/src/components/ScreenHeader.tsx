interface ScreenHeaderProps {
  eyebrow: string
  title: string
  supporting: string
}

export function ScreenHeader({ eyebrow, title, supporting }: ScreenHeaderProps) {
  return (
    <header className="screen-header">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{supporting}</p>
    </header>
  )
}
