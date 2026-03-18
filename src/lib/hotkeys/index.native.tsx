export function Provider({children}: {children: React.ReactNode}) {
  return children
}

export function useHotkeysContext() {
  return {
    enableScope: () => {},
    disableScope: () => {},
  }
}

export function useFeedKeyboardNav() {
  return {
    focusedIndex: -1,
    setFocusedIndex: () => -1,
    itemRef: () => () => {},
  }
}
