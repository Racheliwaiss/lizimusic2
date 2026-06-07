import '@testing-library/jest-dom'

// Polyfill localStorage for jsdom
const localStorageStore = {}
const localStorageMock = {
  getItem:    (k)    => localStorageStore[k] ?? null,
  setItem:    (k, v) => { localStorageStore[k] = String(v) },
  removeItem: (k)    => { delete localStorageStore[k] },
  clear:      ()     => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]) },
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })
