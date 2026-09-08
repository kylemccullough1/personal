import { useState } from 'react'
import { Frame, Icons, type IconName } from '@duckdgoose/win95-ui'

export type FolderItem = {
  id: string
  name: string
  icon: IconName
  kind: string
  detail: string
}

/**
 * Explorer's Details view: one row per item, single click selects, double click or Enter
 * opens. Shared by the Projects and Games folders. Rows are focusable so keyboard users get
 * the same affordances as the mouse.
 */
export function FolderView({ items, onOpen }: { items: FolderItem[]; onOpen: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <>
      <Frame boxShadow="$in" bgColor="white" className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              {['Name', 'Type', 'Details'].map((heading) => (
                <th
                  key={heading}
                  className="sticky top-0 px-[6px] py-[2px] text-left font-normal"
                  style={{
                    background: 'var(--r95-color-material)',
                    boxShadow: 'var(--r95-shadow-out)',
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const Icon = Icons[item.icon]
              const isSelected = selected === item.id
              return (
                <tr
                  key={item.id}
                  data-dg="folder-row"
                  data-dg-item={item.id}
                  tabIndex={0}
                  className="cursor-default select-none outline-none"
                  style={{
                    background: isSelected ? 'var(--r95-color-headerBackground)' : 'transparent',
                    color: isSelected ? 'var(--r95-color-headerText)' : 'inherit',
                  }}
                  onClick={() => setSelected(item.id)}
                  onFocus={() => setSelected(item.id)}
                  onDoubleClick={() => onOpen(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onOpen(item.id)
                    }
                  }}
                >
                  <td className="whitespace-nowrap px-[6px] py-[2px]">
                    <span className="inline-flex items-center gap-[6px]">
                      <Icon variant="16x16_4" />
                      {item.name}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-[6px] py-[2px]">{item.kind}</td>
                  <td className="px-[6px] py-[2px]">{item.detail}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Frame>
      <Frame boxShadow="$in" className="mt-[2px] px-[6px] py-[2px] text-[11px]">
        {items.length} object(s){selected ? ', 1 selected' : ''}
      </Frame>
    </>
  )
}
