import { describe, it, expect } from 'bun:test'
import { JSONInputStringToList } from '../app/utils/withdrawUtils'

describe('JSONInputStringToList', () => {
  it('parses newline separated JSON objects', () => {
    const a = JSON.stringify({ a: 1 })
    const b = JSON.stringify({ b: 2 })
    const input = `${a}\n${b}`
    const list = JSONInputStringToList(input)
    expect(list.length).toBe(2)
    expect(JSON.parse(list[0]).a).toBe(1)
    expect(JSON.parse(list[1]).b).toBe(2)
  })

  it('parses JSON array of objects', () => {
    const arr = [{ x: 'y' }, { z: 3 }]
    const list = JSONInputStringToList(JSON.stringify(arr))
    expect(list.length).toBe(2)
    expect(JSON.parse(list[0]).x).toBe('y')
    expect(JSON.parse(list[1]).z).toBe(3)
  })

  it('recovers JSON objects with leading/trailing chars', () => {
    const bad = `--${JSON.stringify({ k: 'v' })}--\n${JSON.stringify({ ok: true })}`
    const list = JSONInputStringToList(bad)
    expect(list.length).toBe(2)
    expect(JSON.parse(list[0]).k).toBe('v')
    expect(JSON.parse(list[1]).ok).toBe(true)
  })
})

