import { beforeEach, describe, expect, test, vi } from 'vitest'

async function freshService() {
  vi.resetModules()
  return (await import('@/services/notifications.service')).default
}

describe('notificationsService', () => {
  beforeEach(() => localStorage.clear())

  test('getAll ne retourne que les notifications de l\'utilisateur', async () => {
    const service = await freshService()

    const all = service.getAll('2')

    expect(all.length).toBeGreaterThan(0)
    expect(all.every(n => n.userId === '2')).toBe(true)
  })

  test('markAsRead réduit le nombre de non lues', async () => {
    const service = await freshService()
    const before = service.getUnreadCount('1')
    const firstUnread = service.getUnread('1')[0]

    expect(service.markAsRead(firstUnread.id)).toBe(true)

    expect(service.getUnreadCount('1')).toBe(before - 1)
  })

  test('markAsRead retourne false pour un id inconnu', async () => {
    const service = await freshService()
    expect(service.markAsRead('inconnu')).toBe(false)
  })
})
